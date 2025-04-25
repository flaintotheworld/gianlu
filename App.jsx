
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, parse, setHours, setMinutes } from "date-fns";

const MEAL_INTERVALS = {
  desayuno: 4,
  almuerzo: 4,
  once: 4,
  cena: 4,
};

const mealOrder = ["desayuno", "almuerzo", "once", "cena"];

const MEAL_EMOJIS = {
  desayuno: "☀️ Desayuno",
  almuerzo: "🍽️ Almuerzo",
  once: "🥪 Once",
  cena: "🌙 Cena",
};

function parseSimpleTime(input) {
  let cleaned = input.replace(/[^0-9]/g, "");
  if (cleaned.length === 1 || cleaned.length === 2) {
    let hours = parseInt(cleaned);
    if (isNaN(hours) || hours > 23) return null;
    return setMinutes(setHours(new Date(), hours), 0);
  }
  if (cleaned.length === 3 || cleaned.length === 4) {
    let hours = parseInt(cleaned.length === 3 ? cleaned[0] : cleaned.slice(0, 2));
    let minutes = parseInt(cleaned.slice(-2));
    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) return null;
    return setMinutes(setHours(new Date(), hours), minutes);
  }
  return null;
}

function formatTimeTo12hr(time) {
  let hours = time.getHours();
  let minutes = time.getMinutes();
  hours = ((hours + 11) % 12) + 1;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export default function MealTimer() {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const [inputTime, setInputTime] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem(`meal-history-${todayKey}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(`meal-history-${todayKey}`, JSON.stringify(history));
  }, [history, todayKey]);

  const handleCalculate = () => {
    if (!inputTime || !selectedMeal) return;

    const mealTime = parseSimpleTime(inputTime);
    if (!mealTime) {
      setMessage("Por favor ingresa la hora en formato correcto (ej: 930 para 9:30, 1530 para 15:30, o solo 9 para 9:00).");
      return;
    }

    const index = mealOrder.indexOf(selectedMeal);
    const nextMeal = mealOrder[index + 1] || mealOrder[0];
    const hoursToAdd = MEAL_INTERVALS[selectedMeal];
    const nextTime = new Date(mealTime.getTime() + hoursToAdd * 60 * 60 * 1000);

    const nextTimeFormatted = formatTimeTo12hr(nextTime);
    const upperBoundFormatted = formatTimeTo12hr(
      new Date(nextTime.getTime() + 60 * 60 * 1000)
    );

    const mealTimeFormatted = formatTimeTo12hr(mealTime);

    setMessage(
      `Si comiste ${MEAL_EMOJIS[selectedMeal]} a las ${mealTimeFormatted}, te sugerimos comer ${MEAL_EMOJIS[nextMeal]} entre las ${nextTimeFormatted} y las ${upperBoundFormatted}.`
    );

    setHistory((prev) => [
      ...prev,
      `✔️ ${MEAL_EMOJIS[selectedMeal]} a las ${mealTimeFormatted}`
    ]);
  };

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center">¿A qué hora como?</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿Qué acabas de comer?
          </label>
          <select
            className="w-full border rounded p-2"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {mealOrder.map((meal) => (
              <option key={meal} value={meal}>
                {MEAL_EMOJIS[meal]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿A qué hora comiste?
          </label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Ej: 930, 1530 o 9"
            value={inputTime}
            onChange={(e) => setInputTime(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleCalculate}>
          Calcular próxima comida
        </Button>
      </div>
      {message && (
        <Card>
          <CardContent className="p-4">
            <p className="text-lg font-medium">{message}</p>
          </CardContent>
        </Card>
      )}
      {history.length > 0 && (
        <div className="pt-4">
          <h2 className="text-md font-semibold">Resumen del día 📝</h2>
          <ul className="list-disc pl-6 text-sm text-gray-700">
            {history.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
