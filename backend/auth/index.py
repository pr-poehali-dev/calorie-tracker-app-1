import json
import os
import hashlib
import hmac
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для регистрации, входа и управления сессиями пользователей'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'register':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')
                name = body.get('name', '')
                
                if not email or not password:
                    return response(400, {'error': 'Email и пароль обязательны'})
                
                if len(password) < 6:
                    return response(400, {'error': 'Пароль должен быть минимум 6 символов'})
                
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return response(400, {'error': 'Пользователь с таким email уже существует'})
                
                password_hash = hash_password(password)
                cur.execute(
                    "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
                    (email, password_hash, name)
                )
                user_id = cur.fetchone()[0]
                conn.commit()
                
                token = generate_token(user_id, email)
                return response(200, {
                    'success': True,
                    'token': token,
                    'user': {'id': user_id, 'email': email, 'name': name}
                })
            
            elif action == 'login':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')
                
                if not email or not password:
                    return response(400, {'error': 'Email и пароль обязательны'})
                
                cur.execute("SELECT id, password_hash, name FROM users WHERE email = %s", (email,))
                user = cur.fetchone()
                
                if not user or not verify_password(password, user[1]):
                    return response(401, {'error': 'Неверный email или пароль'})
                
                token = generate_token(user[0], email)
                return response(200, {
                    'success': True,
                    'token': token,
                    'user': {'id': user[0], 'email': email, 'name': user[2]}
                })
            
            else:
                return response(400, {'error': 'Неизвестное действие'})
        
        elif method == 'GET':
            token = event.get('headers', {}).get('X-Auth-Token', '')
            if not token:
                return response(401, {'error': 'Токен не предоставлен'})
            
            user_data = verify_token(token)
            if not user_data:
                return response(401, {'error': 'Неверный или истекший токен'})
            
            user_id = user_data['user_id']
            cur.execute("SELECT id, email, name FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return response(401, {'error': 'Пользователь не найден'})
            
            return response(200, {
                'success': True,
                'user': {'id': user[0], 'email': user[1], 'name': user[2]}
            })
        
        else:
            return response(405, {'error': 'Метод не поддерживается'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    
    finally:
        cur.close()
        conn.close()


def hash_password(password: str) -> str:
    salt = os.environ.get('PASSWORD_SALT', 'default_salt_change_in_production')
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def generate_token(user_id: int, email: str) -> str:
    secret = os.environ.get('JWT_SECRET', 'default_secret_change_in_production')
    expiry = int((datetime.now() + timedelta(days=30)).timestamp())
    payload = f"{user_id}:{email}:{expiry}"
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"


def verify_token(token: str) -> dict:
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
