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
  { name: 'Ананас', calories: 50, protein: 0.5, fats: 0.1, carbs: 13, category: 'Фрукты' },
  { name: 'Грейпфрут', calories: 42, protein: 0.8, fats: 0.1, carbs: 11, category: 'Фрукты' },
  { name: 'Миндаль', calories: 579, protein: 21, fats: 50, carbs: 22, category: 'Орехи и семена' },
  { name: 'Грецкий орех', calories: 654, protein: 15, fats: 65, carbs: 14, category: 'Орехи и семена' },
  { name: 'Кешью', calories: 553, protein: 18, fats: 44, carbs: 30, category: 'Орехи и семена' },
  { name: 'Фундук', calories: 628, protein: 15, fats: 61, carbs: 17, category: 'Орехи и семена' },
  { name: 'Арахис', calories: 567, protein: 26, fats: 49, carbs: 16, category: 'Орехи и семена' },
  { name: 'Семечки подсолнечника', calories: 584, protein: 21, fats: 53, carbs: 10, category: 'Орехи и семена' },
  { name: 'Семена чиа', calories: 486, protein: 17, fats: 31, carbs: 42, category: 'Орехи и семена' },
  { name: 'Льняные семена', calories: 534, protein: 18, fats: 42, carbs: 29, category: 'Орехи и семена' },
  { name: 'Чечевица', calories: 116, protein: 9, fats: 0.4, carbs: 20, category: 'Бобовые' },
  { name: 'Нут', calories: 364, protein: 19, fats: 6, carbs: 61, category: 'Бобовые' },
  { name: 'Фасоль красная', calories: 337, protein: 22, fats: 1.7, carbs: 61, category: 'Бобовые' },
  { name: 'Фасоль белая', calories: 333, protein: 23, fats: 2, carbs: 60, category: 'Бобовые' },
  { name: 'Горох', calories: 298, protein: 20, fats: 2, carbs: 53, category: 'Бобовые' },
  { name: 'Соя', calories: 381, protein: 35, fats: 17, carbs: 17, category: 'Бобовые' },
  { name: 'Оливковое масло', calories: 884, protein: 0, fats: 100, carbs: 0, category: 'Масла и жиры' },
  { name: 'Подсолнечное масло', calories: 899, protein: 0, fats: 100, carbs: 0, category: 'Масла и жиры' },
  { name: 'Сливочное масло', calories: 748, protein: 0.5, fats: 83, carbs: 0.8, category: 'Масла и жиры' },
  { name: 'Кокосовое масло', calories: 862, protein: 0, fats: 100, carbs: 0, category: 'Масла и жиры' },
  { name: 'Мед', calories: 329, protein: 0.8, fats: 0, carbs: 82, category: 'Сладости' },
  { name: 'Сахар', calories: 387, protein: 0, fats: 0, carbs: 100, category: 'Сладости' },
  { name: 'Темный шоколад 70%', calories: 546, protein: 6, fats: 35, carbs: 52, category: 'Сладости' },
  { name: 'Молочный шоколад', calories: 535, protein: 7.6, fats: 30, carbs: 60, category: 'Сладости' },
  { name: 'Зефир', calories: 326, protein: 0.8, fats: 0.1, carbs: 79, category: 'Сладости' },
  { name: 'Мармелад', calories: 321, protein: 0, fats: 0.1, carbs: 79, category: 'Сладости' },
  { name: 'Кофе черный', calories: 2, protein: 0.2, fats: 0, carbs: 0.3, category: 'Напитки' },
  { name: 'Чай черный', calories: 1, protein: 0, fats: 0, carbs: 0.3, category: 'Напитки' },
  { name: 'Апельсиновый сок', calories: 45, protein: 0.7, fats: 0.2, carbs: 10, category: 'Напитки' },
  { name: 'Яблочный сок', calories: 46, protein: 0.1, fats: 0.1, carbs: 11, category: 'Напитки' },
  { name: 'Кола', calories: 42, protein: 0, fats: 0, carbs: 10.6, category: 'Напитки' },
];

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Минимальная (сидячая работа)' },
  { value: 1.375, label: 'Низкая (легкие упражнения 1-3 дня/неделя)' },
  { value: 1.55, label: 'Средняя (умеренные упражнения 3-5 дней/неделя)' },
  { value: 1.725, label: 'Высокая (интенсивные упражнения 6-7 дней/неделя)' },
  { value: 1.9, label: 'Очень высокая (физическая работа + тренировки)' },
];

export default function Index() {
  const [userData, setUserData] = useState<UserData>({
    gender: 'male',
    age: 30,
    weight: 70,
    height: 170,
    activity: 1.55,
  });

  const [dailyNorm, setDailyNorm] = useState<DailyNorm | null>(null);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState('100');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('kbzu-meals');
    if (saved) {
      setMealEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kbzu-meals', JSON.stringify(mealEntries));
  }, [mealEntries]);

  const calculateBMR = () => {
    const { gender, age, weight, height, activity } = userData;
    
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
    } else {
      bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
    }

    const calories = Math.round(bmr * activity);
    const protein = Math.round(weight * 1.8);
    const fats = Math.round(weight * 1);
    const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);

    setDailyNorm({ calories, protein, fats, carbs });
    toast.success('Норма КБЖУ рассчитана!');
  };

  const addMealEntry = () => {
    if (!selectedFood) return;

    const multiplier = parseFloat(grams) / 100;
    const entry: MealEntry = {
      id: Date.now().toString(),
      food: {
        ...selectedFood,
        calories: Math.round(selectedFood.calories * multiplier),
        protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
        fats: Math.round(selectedFood.fats * multiplier * 10) / 10,
        carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      },
      grams: parseFloat(grams),
      date: selectedDate,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMealEntries([entry, ...mealEntries]);
    setSelectedFood(null);
    setGrams('100');
    setSearchQuery('');
    toast.success(`Добавлено: ${entry.food.name}`);
  };

  const deleteEntry = (id: string) => {
    setMealEntries(mealEntries.filter(e => e.id !== id));
    toast.success('Запись удалена');
  };

  const todayEntries = mealEntries.filter(e => e.date === selectedDate);
  const todayTotals = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.food.calories,
      protein: acc.protein + entry.food.protein,
      fats: acc.fats + entry.food.fats,
      carbs: acc.carbs + entry.food.carbs,
    }),
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );

  const categories = ['all', ...Array.from(new Set(FOOD_DATABASE.map(f => f.category)))];
  const filteredFoods = FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Трекер КБЖУ</h1>
          <p className="text-gray-600">Рассчитай норму и отслеживай питание</p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="calculator">
              <Icon name="Calculator" size={18} className="mr-2" />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="diary">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Дневник
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={24} />
                  Расчет суточной нормы КБЖУ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Пол</Label>
                    <Select value={userData.gender} onValueChange={(v) => setUserData({ ...userData, gender: v as 'male' | 'female' })}>
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
                    <Input
                      type="number"
                      value={userData.age}
                      onChange={(e) => setUserData({ ...userData, age: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Вес (кг)</Label>
                    <Input
                      type="number"
                      value={userData.weight}
                      onChange={(e) => setUserData({ ...userData, weight: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Рост (см)</Label>
                    <Input
                      type="number"
                      value={userData.height}
                      onChange={(e) => setUserData({ ...userData, height: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Уровень активности</Label>
                  <Select value={userData.activity.toString()} onValueChange={(v) => setUserData({ ...userData, activity: parseFloat(v) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateBMR} className="w-full" size="lg">
                  <Icon name="Sparkles" size={20} className="mr-2" />
                  Рассчитать норму
                </Button>

                {dailyNorm && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                    <h3 className="text-xl font-semibold mb-4 text-center">Ваша суточная норма</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{dailyNorm.calories}</div>
                        <div className="text-sm text-gray-600 mt-1">Калории</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600">{dailyNorm.protein}</div>
                        <div className="text-sm text-gray-600 mt-1">Белки (г)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-orange-600">{dailyNorm.fats}</div>
                        <div className="text-sm text-gray-600 mt-1">Жиры (г)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600">{dailyNorm.carbs}</div>
                        <div className="text-sm text-gray-600 mt-1">Углеводы (г)</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diary" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Plus" size={24} />
                    Добавить продукт
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Дата</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.filter(c => c !== 'all').map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Поиск продукта</Label>
                    <Input
                      placeholder="Начните вводить название..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <ScrollArea className="h-64 border rounded-lg p-2">
                    <div className="space-y-1">
                      {filteredFoods.map((food) => (
                        <button
                          key={food.name}
                          onClick={() => setSelectedFood(food)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedFood?.name === food.name
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            К: {food.calories} | Б: {food.protein}г | Ж: {food.fats}г | У: {food.carbs}г
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>

                  {selectedFood && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <div className="font-semibold text-lg">{selectedFood.name}</div>
                        <div className="text-sm text-gray-600">{selectedFood.category}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Количество (грамм)</Label>
                        <Input
                          type="number"
                          value={grams}
                          onChange={(e) => setGrams(e.target.value)}
                          placeholder="100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-600">Калории</div>
                          <div className="font-bold text-blue-600">
                            {Math.round(selectedFood.calories * (parseFloat(grams) / 100))}
                          </div>
                        </div>
                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-600">Белки</div>
                          <div className="font-bold text-green-600">
                            {Math.round(selectedFood.protein * (parseFloat(grams) / 100) * 10) / 10}г
                          </div>
                        </div>
                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-600">Жиры</div>
                          <div className="font-bold text-orange-600">
                            {Math.round(selectedFood.fats * (parseFloat(grams) / 100) * 10) / 10}г
                          </div>
                        </div>
                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-600">Углеводы</div>
                          <div className="font-bold text-purple-600">
                            {Math.round(selectedFood.carbs * (parseFloat(grams) / 100) * 10) / 10}г
                          </div>
                        </div>
                      </div>

                      <Button onClick={addMealEntry} className="w-full">
                        <Icon name="Check" size={18} className="mr-2" />
                        Добавить в дневник
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={24} />
                    Прогресс за {new Date(selectedDate).toLocaleDateString('ru-RU')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {dailyNorm ? (
                    <>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Калории</span>
                            <span className="text-sm font-bold">
                              {todayTotals.calories} / {dailyNorm.calories}
                            </span>
                          </div>
                          <Progress 
                            value={(todayTotals.calories / dailyNorm.calories) * 100} 
                            className="h-4"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Белки (г)</span>
                            <span className="text-sm font-bold">
                              {Math.round(todayTotals.protein * 10) / 10} / {dailyNorm.protein}
                            </span>
                          </div>
                          <Progress 
                            value={(todayTotals.protein / dailyNorm.protein) * 100} 
                            className="h-4"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Жиры (г)</span>
                            <span className="text-sm font-bold">
                              {Math.round(todayTotals.fats * 10) / 10} / {dailyNorm.fats}
                            </span>
                          </div>
                          <Progress 
                            value={(todayTotals.fats / dailyNorm.fats) * 100} 
                            className="h-4"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Углеводы (г)</span>
                            <span className="text-sm font-bold">
                              {Math.round(todayTotals.carbs * 10) / 10} / {dailyNorm.carbs}
                            </span>
                          </div>
                          <Progress 
                            value={(todayTotals.carbs / dailyNorm.carbs) * 100} 
                            className="h-4"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Съедено сегодня</h4>
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {todayEntries.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-8">
                                Записей пока нет
                              </p>
                            ) : (
                              todayEntries.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium">{entry.food.name}</div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {entry.grams}г • {entry.time}
                                      </div>
                                      <div className="text-xs text-gray-700 mt-1">
                                        {entry.food.calories} ккал | Б: {entry.food.protein}г | Ж: {entry.food.fats}г | У: {entry.food.carbs}г
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteEntry(entry.id)}
                                      className="ml-2"
                                    >
                                      <Icon name="Trash2" size={16} className="text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="Calculator" size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">
                        Сначала рассчитайте вашу суточную норму в калькуляторе
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" size={24} />
                  История записей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {mealEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="BookOpen" size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">История пуста</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Array.from(new Set(mealEntries.map(e => e.date)))
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                        .map(date => {
                          const dateEntries = mealEntries.filter(e => e.date === date);
                          const dateTotals = dateEntries.reduce(
                            (acc, entry) => ({
                              calories: acc.calories + entry.food.calories,
                              protein: acc.protein + entry.food.protein,
                              fats: acc.fats + entry.food.fats,
                              carbs: acc.carbs + entry.food.carbs,
                            }),
                            { calories: 0, protein: 0, fats: 0, carbs: 0 }
                          );

                          return (
                            <div key={date} className="border rounded-lg p-4 bg-white">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">
                                  {new Date(date).toLocaleDateString('ru-RU', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </h3>
                                <div className="text-sm font-medium text-gray-600">
                                  {dateEntries.length} записей
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                  <div className="text-xs text-gray-600 mb-1">Калории</div>
                                  <div className="font-bold text-blue-600">{dateTotals.calories}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-600 mb-1">Белки</div>
                                  <div className="font-bold text-green-600">{Math.round(dateTotals.protein * 10) / 10}г</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-600 mb-1">Жиры</div>
                                  <div className="font-bold text-orange-600">{Math.round(dateTotals.fats * 10) / 10}г</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-600 mb-1">Углеводы</div>
                                  <div className="font-bold text-purple-600">{Math.round(dateTotals.carbs * 10) / 10}г</div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {dateEntries.map(entry => (
                                  <div
                                    key={entry.id}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">{entry.food.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          {entry.grams}г • {entry.time}
                                        </div>
                                        <div className="text-xs text-gray-700 mt-1">
                                          {entry.food.calories} ккал | Б: {entry.food.protein}г | Ж: {entry.food.fats}г | У: {entry.food.carbs}г
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
