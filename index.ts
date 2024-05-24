import express, { Express, Request, Response } from "express";
import cors from 'cors';
import * as fs from 'fs';
const port = 8000;
const app: Express = express();

app.use(express.json());
app.use(cors());

interface Station {
   address: string,
   status: boolean
}

interface StationDTO {
   id: number,
   address: string,
   status: boolean
}

let lastTemperatureValue: number = 36;
let lastDoseRateValue: number = 5;
let lastHumidityValue: number = 75;

//Function generat random metrix
function generateRandomNumbers(min: number, max: number, lastValue: number): number {
   if (lastValue === null) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   } else {
      const low: number = Math.max(min, lastValue - 1);
      const high: number = Math.min(max, lastValue + 1);
      return Math.floor(Math.random() * (high - low + 1)) + low;
   }
};

//Function read file
const readStationsFromFile = (): StationDTO[] => {
   try {
      console.log('Читання файлу stations.json...');
      if (!fs.existsSync('stations.json')) {
         console.log("Файл stations.json не існує, повертаємо порожній масив.");
         return [];
      }
      const data = fs.readFileSync('stations.json', 'utf-8');
      console.log('Файл прочитано успішно.');
      return data.length ? JSON.parse(data) as StationDTO[] : [];
   } catch (error) {
      console.error('Помилка при зчитуванні файлу stations.json:', error);
      return [];
   }
};

//Function write file
const writeStationsToFile = (stations: Station[]): void => {
   try {
      console.log('Запис у файл stations.json...');
      fs.writeFileSync('stations.json', JSON.stringify(stations, null, 2));
      console.log('Запис виконано успішно.');
   } catch (error) {
      console.error('Помилка при записі у файл stations.json:', error);
   }
};

//Routes
app.get("/stations", (req: Request, res: Response) => {
   try {
      console.log('Отримання всіх станцій...');
      const stations = readStationsFromFile();
      console.log("Станції успішно отримані:", stations);
      res.send(stations);
   } catch (error) {
      console.error('Внутрішня помилка сервера при отриманні станцій:', error);
      res.status(500).send('Внутрішня помилка сервера');
   }
});

app.get("/stations/:id", (req: Request, res: Response) => {
   try {
      const stations = readStationsFromFile();
      const stationID = Number(req.params.id);
      const station = stations.find(st => st.id === stationID);
      if (!station) {
         return res.status(404).send('Станція не знайдена');
      }
      res.send(station);
   } catch (error) {
      console.error('Внутрішня помилка сервера при отриманні станції:', error);
      res.status(500).send('Внутрішня помилка сервера');
   }
});

app.post("/stations", (req: Request, res: Response) => {
   try {
      const stations: StationDTO[] = readStationsFromFile();
      const station = req.body;
      const stationId = stations.length ? stations[stations.length - 1].id + 1 : 1;
      const newStation = { ...station, id: stationId };
      stations.push(newStation);
      writeStationsToFile(stations);
      res.send(newStation);
   } catch (error) {
      console.error('Внутрішня помилка сервера при запису станції:', error);
      res.status(500).send('Внутрішня помилка сервера');
   }
});

app.delete("/stations/:id", (req: Request, res: Response) => {
   try {
      let stations = readStationsFromFile();
      const stationID = Number(req.params.id);
      const station = stations.findIndex(st => st.id === stationID);
      if (station === -1) {
         return res.status(404).send('Станція не знайдена');
      }
      stations = stations.filter(st => st.id != stationID);
      writeStationsToFile(stations);
      res.send(`Станція ${req.params.id} була видалена`);
   } catch (error) {
      console.error('Внутрішня помилка сервера при видаленні станції:', error);
      res.status(500).send('Внутрішня помилка сервера');
   }
});

app.put("/stations/:id", (req: Request, res: Response) => {
   try {
      const stations = readStationsFromFile();
      const stationID = Number(req.params.id);
      const index = stations.findIndex(st => st.id === stationID);
      if (index === -1) {
         return res.status(404).send('Станція не знайдена');
      }
      stations[index] = {
         ...stations[index],
         ...req.body
      };
      writeStationsToFile(stations);
      res.send(stations[index]);
   } catch (error) {
      console.error('Внутрішня помилка сервера при оновленні станції:', error);
      res.status(500).send('Внутрішня помилка сервера');
   }
});

app.get("/stations/:id/metrics", (req: Request, res: Response) => {
   try {
      const stations = readStationsFromFile();
      const stationID = Number(req.params.id);
      const station = stations.find(st => st.id === stationID);
      if (!station) {
         return res.status(404).send('Станція не знайдена');
      }
      if (!station.status) {
         res.send({
            temperature: 0,
            dose_rate: 0,
            humidity: 0
         });
      } else {
         lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
         lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
         lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);

         res.send({
            temperature: lastTemperatureValue,
            dose_rate: lastDoseRateValue,
            humidity: lastHumidityValue
         });
      }
   } catch (error) {
      console.error('Внутрішня помилка сервера при отриманні метрик станції:', error);
      res.status(500).send('Внутрішня помилка сервера');
   }
});

//Start server
app.listen(port, () => {
   console.log(`now listening on port ${port}`);
});
