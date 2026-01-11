import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import AuthModal from '@/components/AuthModal';
import { api, type User } from '@/lib/api';

interface UserData {
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  activity: number;
}

interface DailyNorm {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  category: string;
}

interface MealEntry {
  id: string;
  food: FoodItem;
  grams: number;
  date: string;
  time: string;
}

const FOOD_DATABASE: FoodItem[] = [
  { name: 'Куриная грудка', calories: 165, protein: 31, fats: 3.6, carbs: 0, category: 'Мясо и птица' },
  { name: 'Говядина постная', calories: 250, protein: 26, fats: 15, carbs: 0, category: 'Мясо и птица' },
  { name: 'Свинина нежирная', calories: 242, protein: 16, fats: 21, carbs: 0, category: 'Мясо и птица' },
  { name: 'Индейка', calories: 157, protein: 29, fats: 4, carbs: 0, category: 'Мясо и птица' },
  { name: 'Утка', calories: 308, protein: 16, fats: 28, carbs: 0, category: 'Мясо и птица' },
  { name: 'Кролик', calories: 183, protein: 21, fats: 11, carbs: 0, category: 'Мясо и птица' },
  { name: 'Баранина', calories: 294, protein: 16, fats: 25, carbs: 0, category: 'Мясо и птица' },
  { name: 'Телятина', calories: 172, protein: 20, fats: 10, carbs: 0, category: 'Мясо и птица' },
  { name: 'Куриное бедро', calories: 211, protein: 18, fats: 15, carbs: 0, category: 'Мясо и птица' },
  { name: 'Куриные крылышки', calories: 203, protein: 19, fats: 14, carbs: 0, category: 'Мясо и птица' },
  { name: 'Лосось', calories: 208, protein: 20, fats: 13, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Тунец', calories: 144, protein: 23, fats: 5, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Треска', calories: 82, protein: 18, fats: 0.7, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Креветки', calories: 99, protein: 24, fats: 0.3, carbs: 0.2, category: 'Рыба и морепродукты' },
  { name: 'Кальмары', calories: 92, protein: 18, fats: 1.4, carbs: 3, category: 'Рыба и морепродукты' },
  { name: 'Минтай', calories: 72, protein: 16, fats: 1, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Сельдь', calories: 246, protein: 17, fats: 19, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Скумбрия', calories: 191, protein: 18, fats: 13, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Форель', calories: 119, protein: 20, fats: 3, carbs: 0, category: 'Рыба и морепродукты' },
  { name: 'Мидии', calories: 86, protein: 12, fats: 2, carbs: 3.7, category: 'Рыба и морепродукты' },
  { name: 'Молоко 3,2%', calories: 59, protein: 2.8, fats: 3.2, carbs: 4.7, category: 'Молочные продукты' },
  { name: 'Молоко 1,5%', calories: 44, protein: 2.8, fats: 1.5, carbs: 4.7, category: 'Молочные продукты' },
  { name: 'Кефир 2,5%', calories: 50, protein: 2.8, fats: 2.5, carbs: 3.9, category: 'Молочные продукты' },
  { name: 'Творог 9%', calories: 159, protein: 16, fats: 9, carbs: 2, category: 'Молочные продукты' },
  { name: 'Творог обезжиренный', calories: 71, protein: 16, fats: 0.2, carbs: 1.3, category: 'Молочные продукты' },
  { name: 'Йогурт натуральный', calories: 66, protein: 5, fats: 3.2, carbs: 3.5, category: 'Молочные продукты' },
  { name: 'Сметана 20%', calories: 206, protein: 2.8, fats: 20, carbs: 3.2, category: 'Молочные продукты' },
  { name: 'Сыр твердый', calories: 360, protein: 26, fats: 27, carbs: 0, category: 'Молочные продукты' },
  { name: 'Моцарелла', calories: 280, protein: 28, fats: 17, carbs: 3, category: 'Молочные продукты' },
  { name: 'Сливки 10%', calories: 119, protein: 3, fats: 10, carbs: 4, category: 'Молочные продукты' },
  { name: 'Яйцо куриное', calories: 157, protein: 12.7, fats: 11.5, carbs: 0.7, category: 'Яйца' },
  { name: 'Яйцо перепелиное', calories: 168, protein: 11.9, fats: 13.1, carbs: 0.6, category: 'Яйца' },
  { name: 'Рис белый', calories: 344, protein: 6.7, fats: 0.7, carbs: 78, category: 'Крупы и каши' },
  { name: 'Рис бурый', calories: 337, protein: 7.4, fats: 1.8, carbs: 77, category: 'Крупы и каши' },
  { name: 'Гречка', calories: 308, protein: 12.6, fats: 3.3, carbs: 57, category: 'Крупы и каши' },
  { name: 'Овсянка', calories: 342, protein: 12, fats: 6, carbs: 60, category: 'Крупы и каши' },
  { name: 'Перловка', calories: 315, protein: 9.3, fats: 1.1, carbs: 66, category: 'Крупы и каши' },
  { name: 'Пшено', calories: 348, protein: 11, fats: 3.3, carbs: 66, category: 'Крупы и каши' },
  { name: 'Киноа', calories: 368, protein: 14, fats: 6, carbs: 57, category: 'Крупы и каши' },
  { name: 'Булгур', calories: 342, protein: 12, fats: 1.3, carbs: 76, category: 'Крупы и каши' },
  { name: 'Хлеб белый', calories: 242, protein: 8.1, fats: 1, carbs: 49, category: 'Хлеб и выпечка' },
  { name: 'Хлеб черный', calories: 201, protein: 6.6, fats: 1.2, carbs: 40, category: 'Хлеб и выпечка' },
  { name: 'Хлеб цельнозерновой', calories: 213, protein: 7, fats: 1.1, carbs: 41, category: 'Хлеб и выпечка' },
  { name: 'Багет', calories: 262, protein: 7.5, fats: 0.5, carbs: 55, category: 'Хлеб и выпечка' },
  { name: 'Лаваш', calories: 275, protein: 8.1, fats: 1, carbs: 56, category: 'Хлеб и выпечка' },
  { name: 'Макароны', calories: 344, protein: 10, fats: 1.1, carbs: 71, category: 'Макароны' },
  { name: 'Макароны цельнозерновые', calories: 335, protein: 14, fats: 2.5, carbs: 62, category: 'Макароны' },
  { name: 'Лапша рисовая', calories: 364, protein: 3.4, fats: 0.6, carbs: 82, category: 'Макароны' },
  { name: 'Брокколи', calories: 34, protein: 2.8, fats: 0.4, carbs: 7, category: 'Овощи' },
  { name: 'Цветная капуста', calories: 25, protein: 2, fats: 0.3, carbs: 5, category: 'Овощи' },
  { name: 'Морковь', calories: 41, protein: 0.9, fats: 0.2, carbs: 10, category: 'Овощи' },
  { name: 'Помидоры', calories: 18, protein: 0.9, fats: 0.2, carbs: 3.9, category: 'Овощи' },
  { name: 'Огурцы', calories: 15, protein: 0.8, fats: 0.1, carbs: 3.6, category: 'Овощи' },
  { name: 'Перец болгарский', calories: 27, protein: 1.3, fats: 0, carbs: 5.3, category: 'Овощи' },
  { name: 'Кабачок', calories: 17, protein: 0.6, fats: 0.3, carbs: 4.6, category: 'Овощи' },
  { name: 'Баклажан', calories: 24, protein: 1.2, fats: 0.1, carbs: 4.5, category: 'Овощи' },
  { name: 'Капуста белокочанная', calories: 27, protein: 1.8, fats: 0.1, carbs: 4.7, category: 'Овощи' },
  { name: 'Свекла', calories: 43, protein: 1.5, fats: 0.1, carbs: 8.8, category: 'Овощи' },
  { name: 'Тыква', calories: 26, protein: 1, fats: 0.1, carbs: 7, category: 'Овощи' },
  { name: 'Шпинат', calories: 23, protein: 2.9, fats: 0.4, carbs: 3.6, category: 'Овощи' },
  { name: 'Салат листовой', calories: 15, protein: 1.2, fats: 0.2, carbs: 2.3, category: 'Овощи' },
  { name: 'Лук репчатый', calories: 40, protein: 1.4, fats: 0, carbs: 10, category: 'Овощи' },
  { name: 'Чеснок', calories: 149, protein: 6.5, fats: 0.5, carbs: 30, category: 'Овощи' },
  { name: 'Картофель', calories: 77, protein: 2, fats: 0.4, carbs: 16, category: 'Овощи' },
  { name: 'Картофель фри', calories: 312, protein: 3.4, fats: 15, carbs: 41, category: 'Овощи' },
  { name: 'Яблоко', calories: 52, protein: 0.4, fats: 0.4, carbs: 14, category: 'Фрукты' },
  { name: 'Банан', calories: 89, protein: 1.1, fats: 0.3, carbs: 23, category: 'Фрукты' },
  { name: 'Апельсин', calories: 47, protein: 0.9, fats: 0.1, carbs: 12, category: 'Фрукты' },
  { name: 'Груша', calories: 57, protein: 0.4, fats: 0.1, carbs: 15, category: 'Фрукты' },
  { name: 'Киви', calories: 61, protein: 1.1, fats: 0.5, carbs: 15, category: 'Фрукты' },
  { name: 'Виноград', calories: 69, protein: 0.7, fats: 0.2, carbs: 18, category: 'Фрукты' },
  { name: 'Клубника', calories: 32, protein: 0.7, fats: 0.3, carbs: 7.7, category: 'Фрукты' },
  { name: 'Малина', calories: 52, protein: 1.2, fats: 0.7, carbs: 12, category: 'Фрукты' },
  { name: 'Черника', calories: 57, protein: 0.7, fats: 0.3, carbs: 14, category: 'Фрукты' },
  { name: 'Арбуз', calories: 30, protein: 0.6, fats: 0.2, carbs: 7.6, category: 'Фрукты' },
  { name: 'Дыня', calories: 34, protein: 0.8, fats: 0.2, carbs: 8.6, category: 'Фрукты' },
  { name: 'Персик', calories: 39, protein: 0.9, fats: 0.3, carbs: 10, category: 'Фрукты' },
  { name: 'Абрикос', calories: 48, protein: 1.4, fats: 0.4, carbs: 11, category: 'Фрукты' },
  { name: 'Слива', calories: 46, protein: 0.7, fats: 0.3, carbs: 11, category: 'Фрукты' },
  { name: 'Манго', calories: 60, protein: 0.8, fats: 0.4, carbs: 15, category: 'Фрукты' },
  { name: 'Ананас', calories: 50, protein: 0.5, fats: 0.2, carbs: 13, category: 'Фрукты' },
  { name: 'Грейпфрут', calories: 35, protein: 0.7, fats: 0.1, carbs: 9, category: 'Фрукты' },
  { name: 'Миндаль', calories: 609, protein: 21, fats: 54, carbs: 13, category: 'Орехи и семена' },
  { name: 'Грецкий орех', calories: 654, protein: 15, fats: 65, carbs: 7, category: 'Орехи и семена' },
  { name: 'Кешью', calories: 553, protein: 18, fats: 44, carbs: 30, category: 'Орехи и семена' },
  { name: 'Фундук', calories: 628, protein: 15, fats: 61, carbs: 17, category: 'Орехи и семена' },
  { name: 'Арахис', calories: 567, protein: 26, fats: 49, carbs: 16, category: 'Орехи и семена' },
  { name: 'Семена подсолнечника', calories: 584, protein: 21, fats: 52, carbs: 11, category: 'Орехи и семена' },
  { name: 'Семена тыквы', calories: 559, protein: 30, fats: 49, carbs: 11, category: 'Орехи и семена' },
  { name: 'Семена чиа', calories: 486, protein: 17, fats: 31, carbs: 42, category: 'Орехи и семена' },
  { name: 'Оливковое масло', calories: 884, protein: 0, fats: 100, carbs: 0, category: 'Масла и жиры' },
  { name: 'Подсолнечное масло', calories: 884, protein: 0, fats: 100, carbs: 0, category: 'Масла и жиры' },
  { name: 'Сливочное масло', calories: 748, protein: 0.5, fats: 83, carbs: 0.8, category: 'Масла и жиры' },
  { name: 'Кокосовое масло', calories: 862, protein: 0, fats: 100, carbs: 0, category: 'Масла и жиры' },
  { name: 'Авокадо', calories: 160, protein: 2, fats: 15, carbs: 9, category: 'Овощи' },
  { name: 'Темный шоколад 70%', calories: 546, protein: 6, fats: 31, carbs: 52, category: 'Сладости' },
  { name: 'Молочный шоколад', calories: 535, protein: 8, fats: 30, carbs: 59, category: 'Сладости' },
  { name: 'Мед', calories: 329, protein: 0.3, fats: 0, carbs: 82, category: 'Сладости' },
  { name: 'Сахар', calories: 387, protein: 0, fats: 0, carbs: 100, category: 'Сладости' },
];

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userData, setUserData] = useState<UserData>({
    gender: 'male',
    age: 30,
    weight: 70,
    height: 170,
    activity: 1.375,
  });

  const [dailyNorm, setDailyNorm] = useState<DailyNorm>({
    calories: 2000,
    protein: 150,
    fats: 67,
    carbs: 200,
  });

  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState<string>('100');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    if (api.isAuthenticated()) {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserData();
      } else {
        setShowAuthModal(true);
      }
    } else {
      setShowAuthModal(true);
    }
    setIsLoading(false);
  };

  const loadUserData = async () => {
    try {
      const profile = await api.getProfile();
      if (profile) {
        setUserData({
          gender: profile.gender,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          activity: profile.activity,
        });
        if (profile.dailyNorm) {
          setDailyNorm(profile.dailyNorm);
        } else {
          calculateNorms({
            gender: profile.gender,
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            activity: profile.activity,
          });
        }
      }

      const mealsData = await api.getMeals();
      setMeals(mealsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Ошибка загрузки данных');
    }
  };

  const handleAuthSuccess = async () => {
    const currentUser = await api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await loadUserData();
      toast.success(`Добро пожаловать, ${currentUser.name}!`);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setMeals([]);
    setShowAuthModal(true);
    toast.success('Вы вышли из системы');
  };

  const calculateNorms = (data: UserData) => {
    let bmr: number;
    if (data.gender === 'male') {
      bmr = 88.36 + 13.4 * data.weight + 4.8 * data.height - 5.7 * data.age;
    } else {
      bmr = 447.6 + 9.2 * data.weight + 3.1 * data.height - 4.3 * data.age;
    }

    const calories = Math.round(bmr * data.activity);
    const protein = Math.round(data.weight * 2);
    const fats = Math.round((calories * 0.3) / 9);
    const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

    const newNorm = { calories, protein, fats, carbs };
    setDailyNorm(newNorm);
    return newNorm;
  };

  const handleSaveProfile = async () => {
    const newNorm = calculateNorms(userData);
    
    const success = await api.saveProfile({
      ...userData,
      dailyNorm: newNorm,
    });

    if (success) {
      toast.success('Профиль сохранен!');
    } else {
      toast.error('Ошибка сохранения профиля');
    }
  };

  const categories = ['all', ...Array.from(new Set(FOOD_DATABASE.map(food => food.category)))];

  const filteredFoods = FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addMeal = async () => {
    if (!selectedFood) return;

    const gramsNum = parseInt(grams);
    if (isNaN(gramsNum) || gramsNum <= 0) {
      toast.error('Введите корректный вес');
      return;
    }

    const now = new Date();
    const mealData = {
      food: selectedFood,
      grams: gramsNum,
      date: selectedDate,
      time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    const mealId = await api.addMeal(mealData);
    if (mealId) {
      setMeals([...meals, { ...mealData, id: mealId }]);
      toast.success(`Добавлено: ${selectedFood.name} (${gramsNum}г)`);
      setSelectedFood(null);
      setGrams('100');
      setSearchTerm('');
    } else {
      toast.error('Ошибка добавления приема пищи');
    }
  };

  const deleteMeal = async (id: string) => {
    const success = await api.deleteMeal(id);
    if (success) {
      setMeals(meals.filter(meal => meal.id !== id));
      toast.success('Прием пищи удален');
    } else {
      toast.error('Ошибка удаления');
    }
  };

  const todayMeals = meals.filter(meal => meal.date === selectedDate);

  const totalConsumed = todayMeals.reduce(
    (acc, meal) => {
      const multiplier = meal.grams / 100;
      return {
        calories: acc.calories + meal.food.calories * multiplier,
        protein: acc.protein + meal.food.protein * multiplier,
        fats: acc.fats + meal.food.fats * multiplier,
        carbs: acc.carbs + meal.food.carbs * multiplier,
      };
    },
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <AuthModal 
        open={showAuthModal} 
        onClose={() => {}} 
        onSuccess={handleAuthSuccess}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-xl shadow-lg">
              <Icon name="Apple" size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Калькулятор калорий</h1>
              <p className="text-gray-600">Контролируйте питание и достигайте целей</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Привет, {user.name}!</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={24} />
                Личные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Пол</Label>
                  <Select value={userData.gender} onValueChange={(value: 'male' | 'female') => setUserData({ ...userData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="female">Женский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Возраст (лет)</Label>
                  <Input type="number" value={userData.age} onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="space-y-2">
                  <Label>Вес (кг)</Label>
                  <Input type="number" value={userData.weight} onChange={(e) => setUserData({ ...userData, weight: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="space-y-2">
                  <Label>Рост (см)</Label>
                  <Input type="number" value={userData.height} onChange={(e) => setUserData({ ...userData, height: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Уровень активности</Label>
                <Select value={userData.activity.toString()} onValueChange={(value) => setUserData({ ...userData, activity: parseFloat(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">Минимальная (сидячий образ жизни)</SelectItem>
                    <SelectItem value="1.375">Низкая (1-3 раза в неделю)</SelectItem>
                    <SelectItem value="1.55">Средняя (3-5 раз в неделю)</SelectItem>
                    <SelectItem value="1.725">Высокая (6-7 раз в неделю)</SelectItem>
                    <SelectItem value="1.9">Очень высокая (2 раза в день)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Icon name="Save" size={18} className="mr-2" />
                Рассчитать и сохранить
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Target" size={24} />
                Дневная норма
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700">Калории</span>
                    <span className="text-sm">
                      <span className="font-bold text-lg">{Math.round(totalConsumed.calories)}</span>
                      <span className="text-gray-500"> / {dailyNorm.calories} ккал</span>
                    </span>
                  </div>
                  <Progress value={(totalConsumed.calories / dailyNorm.calories) * 100} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Icon name="Beef" className="mx-auto mb-1 text-red-500" size={24} />
                      <p className="text-xs text-gray-600">Белки</p>
                      <p className="font-bold">{Math.round(totalConsumed.protein)}г</p>
                      <p className="text-xs text-gray-500">из {dailyNorm.protein}г</p>
                    </div>
                    <Progress value={(totalConsumed.protein / dailyNorm.protein) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-center">
                      <Icon name="Droplet" className="mx-auto mb-1 text-yellow-500" size={24} />
                      <p className="text-xs text-gray-600">Жиры</p>
                      <p className="font-bold">{Math.round(totalConsumed.fats)}г</p>
                      <p className="text-xs text-gray-500">из {dailyNorm.fats}г</p>
                    </div>
                    <Progress value={(totalConsumed.fats / dailyNorm.fats) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-center">
                      <Icon name="Wheat" className="mx-auto mb-1 text-orange-500" size={24} />
                      <p className="text-xs text-gray-600">Углеводы</p>
                      <p className="font-bold">{Math.round(totalConsumed.carbs)}г</p>
                      <p className="text-xs text-gray-500">из {dailyNorm.carbs}г</p>
                    </div>
                    <Progress value={(totalConsumed.carbs / dailyNorm.carbs) * 100} className="h-2" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Остаток:</span> {Math.max(0, Math.round(dailyNorm.calories - totalConsumed.calories))} ккал
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Icon name="UtensilsCrossed" size={24} />
              Дневник питания
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить прием пищи
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Icon name="History" size={18} />
                  История
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div className="space-y-2">
                  <Label>Дата</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Категория продуктов</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Поиск продукта</Label>
                  <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-3 text-gray-400" size={18} />
                    <Input 
                      placeholder="Начните вводить название..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {searchTerm && (
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    {filteredFoods.map((food, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedFood(food);
                          setSearchTerm(food.name);
                        }}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedFood?.name === food.name ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
                        }`}
                      >
                        <p className="font-semibold">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.category}</p>
                        <p className="text-xs text-gray-600">
                          {food.calories} ккал | Б: {food.protein}г Ж: {food.fats}г У: {food.carbs}г
                        </p>
                      </div>
                    ))}
                  </ScrollArea>
                )}

                {selectedFood && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                    <h3 className="font-semibold text-lg">{selectedFood.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Label htmlFor="grams">Вес (грамм)</Label>
                        <Input
                          id="grams"
                          type="number"
                          value={grams}
                          onChange={(e) => setGrams(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="w-full">
                          <p className="text-xs text-gray-600">На {grams}г:</p>
                          <p className="font-bold">{Math.round(selectedFood.calories * (parseInt(grams) || 0) / 100)} ккал</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Белки:</span>
                        <span className="font-semibold ml-1">{((selectedFood.protein * (parseInt(grams) || 0)) / 100).toFixed(1)}г</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Жиры:</span>
                        <span className="font-semibold ml-1">{((selectedFood.fats * (parseInt(grams) || 0)) / 100).toFixed(1)}г</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Углеводы:</span>
                        <span className="font-semibold ml-1">{((selectedFood.carbs * (parseInt(grams) || 0)) / 100).toFixed(1)}г</span>
                      </div>
                    </div>
                    <Button onClick={addMeal} className="w-full bg-green-500 hover:bg-green-600">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить в дневник
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                <ScrollArea className="h-96">
                  {todayMeals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Icon name="Salad" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Нет записей за выбранную дату</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayMeals.map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name="Clock" size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-500">{meal.time}</span>
                            </div>
                            <p className="font-semibold">{meal.food.name}</p>
                            <p className="text-sm text-gray-600">{meal.grams}г</p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>{Math.round((meal.food.calories * meal.grams) / 100)} ккал</span>
                              <span>Б: {Math.round((meal.food.protein * meal.grams) / 100)}г</span>
                              <span>Ж: {Math.round((meal.food.fats * meal.grams) / 100)}г</span>
                              <span>У: {Math.round((meal.food.carbs * meal.grams) / 100)}г</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteMeal(meal.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
