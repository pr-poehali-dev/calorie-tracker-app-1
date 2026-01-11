import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для работы с профилями пользователей и записями питания'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    token = event.get('headers', {}).get('X-Auth-Token', '')
    if not token:
        return response(401, {'error': 'Токен не предоставлен'})
    
    user_data = verify_token(token)
    if not user_data:
        return response(401, {'error': 'Неверный токен'})
    
    user_id = user_data['user_id']
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        path = event.get('queryStringParameters', {}).get('path', '')
        
        if path == 'profile':
            if method == 'GET':
                cur.execute(
                    "SELECT gender, age, weight, height, activity_level, daily_calories, daily_protein, daily_fats, daily_carbs FROM user_profiles WHERE user_id = %s",
                    (user_id,)
                )
                profile = cur.fetchone()
                if not profile:
                    return response(200, {'profile': None})
                
                return response(200, {
                    'profile': {
                        'gender': profile[0],
                        'age': profile[1],
                        'weight': float(profile[2]),
                        'height': float(profile[3]),
                        'activity': float(profile[4]),
                        'dailyNorm': {
                            'calories': profile[5],
                            'protein': profile[6],
                            'fats': profile[7],
                            'carbs': profile[8]
                        }
                    }
                })
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                gender = body.get('gender')
                age = body.get('age')
                weight = body.get('weight')
                height = body.get('height')
                activity = body.get('activity')
                daily_norm = body.get('dailyNorm', {})
                
                cur.execute(
                    """
                    INSERT INTO user_profiles (user_id, gender, age, weight, height, activity_level, daily_calories, daily_protein, daily_fats, daily_carbs)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_id) DO UPDATE SET
                        gender = EXCLUDED.gender,
                        age = EXCLUDED.age,
                        weight = EXCLUDED.weight,
                        height = EXCLUDED.height,
                        activity_level = EXCLUDED.activity_level,
                        daily_calories = EXCLUDED.daily_calories,
                        daily_protein = EXCLUDED.daily_protein,
                        daily_fats = EXCLUDED.daily_fats,
                        daily_carbs = EXCLUDED.daily_carbs,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (user_id, gender, age, weight, height, activity,
                     daily_norm.get('calories'), daily_norm.get('protein'),
                     daily_norm.get('fats'), daily_norm.get('carbs'))
                )
                conn.commit()
                return response(200, {'success': True})
        
        elif path == 'meals':
            if method == 'GET':
                start_date = event.get('queryStringParameters', {}).get('startDate')
                end_date = event.get('queryStringParameters', {}).get('endDate')
                
                query = "SELECT id, food_name, food_category, grams, calories, protein, fats, carbs, meal_date, meal_time FROM meal_entries WHERE user_id = %s"
                params = [user_id]
                
                if start_date:
                    query += " AND meal_date >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND meal_date <= %s"
                    params.append(end_date)
                
                query += " ORDER BY meal_date DESC, meal_time DESC"
                
                cur.execute(query, params)
                meals = cur.fetchall()
                
                return response(200, {
                    'meals': [
                        {
                            'id': str(m[0]),
                            'food': {
                                'name': m[1],
                                'category': m[2],
                                'calories': m[4],
                                'protein': float(m[5]),
                                'fats': float(m[6]),
                                'carbs': float(m[7])
                            },
                            'grams': float(m[3]),
                            'date': m[8].isoformat(),
                            'time': m[9].strftime('%H:%M')
                        }
                        for m in meals
                    ]
                })
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                food = body.get('food', {})
                grams = body.get('grams')
                meal_date = body.get('date')
                meal_time = body.get('time')
                
                cur.execute(
                    """
                    INSERT INTO meal_entries (user_id, food_name, food_category, grams, calories, protein, fats, carbs, meal_date, meal_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (user_id, food.get('name'), food.get('category'), grams,
                     food.get('calories'), food.get('protein'), food.get('fats'),
                     food.get('carbs'), meal_date, meal_time)
                )
                meal_id = cur.fetchone()[0]
                conn.commit()
                return response(200, {'success': True, 'id': str(meal_id)})
            
            elif method == 'DELETE':
                meal_id = event.get('queryStringParameters', {}).get('id')
                if not meal_id:
                    return response(400, {'error': 'ID записи не указан'})
                
                cur.execute("DELETE FROM meal_entries WHERE id = %s AND user_id = %s", (meal_id, user_id))
                conn.commit()
                return response(200, {'success': True})
        
        else:
            return response(400, {'error': 'Неизвестный путь'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    
    finally:
        cur.close()
        conn.close()


def verify_token(token: str) -> dict:
    import hmac
    import hashlib
    try:
        parts = token.split(':')
        if len(parts) != 4:
            return None
        
        user_id, email, expiry, signature = parts
        secret = os.environ.get('JWT_SECRET', 'default_secret_change_in_production')
        payload = f"{user_id}:{email}:{expiry}"
        expected_signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
        if signature != expected_signature:
            return None
        
        if int(expiry) < datetime.now().timestamp():
            return None
        
        return {'user_id': int(user_id), 'email': email}
    except:
        return None


def response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False
    }
