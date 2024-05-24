"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs = __importStar(require("fs"));
const port = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
let lastTemperatureValue = 36;
let lastDoseRateValue = 5;
let lastHumidityValue = 75;
function generateRandomNumbers(min, max, lastValue) {
    if (lastValue === null) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    else {
        const low = Math.max(min, lastValue - 1);
        const high = Math.min(max, lastValue + 1);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }
}
;
const readStationsFromFile = () => {
    try {
        console.log('Читання файлу stations.json...');
        if (!fs.existsSync('stations.json')) {
            console.log("Файл stations.json не існує, повертаємо порожній масив.");
            return [];
        }
        const data = fs.readFileSync('stations.json', 'utf-8');
        console.log('Файл прочитано успішно.');
        return data.length ? JSON.parse(data) : [];
    }
    catch (error) {
        console.error('Помилка при зчитуванні файлу stations.json:', error);
        return [];
    }
};
const writeStationsToFile = (stations) => {
    try {
        console.log('Запис у файл stations.json...');
        fs.writeFileSync('stations.json', JSON.stringify(stations, null, 2));
        console.log('Запис виконано успішно.');
    }
    catch (error) {
        console.error('Помилка при записі у файл stations.json:', error);
    }
};
app.get("/stations", (req, res) => {
    try {
        console.log('Отримання всіх станцій...');
        const stations = readStationsFromFile();
        console.log("Станції успішно отримані:", stations);
        res.send(stations);
    }
    catch (error) {
        console.error('Внутрішня помилка сервера при отриманні станцій:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});
app.get("/stations/:id", (req, res) => {
    try {
        const stations = readStationsFromFile();
        const stationID = Number(req.params.id);
        const station = stations.find(st => st.id === stationID);
        if (!station) {
            return res.status(404).send('Станція не знайдена');
        }
        res.send(station);
    }
    catch (error) {
        console.error('Внутрішня помилка сервера при отриманні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});
app.post("/stations", (req, res) => {
    try {
        const stations = readStationsFromFile();
        const station = req.body;
        const stationId = stations.length ? stations[stations.length - 1].id + 1 : 1;
        const newStation = Object.assign(Object.assign({}, station), { id: stationId });
        stations.push(newStation);
        writeStationsToFile(stations);
        res.send(newStation);
    }
    catch (error) {
        console.error('Внутрішня помилка сервера при запису станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});
app.delete("/stations/:id", (req, res) => {
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
    }
    catch (error) {
        console.error('Внутрішня помилка сервера при видаленні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});
app.put("/stations/:id", (req, res) => {
    try {
        const stations = readStationsFromFile();
        const stationID = Number(req.params.id);
        const index = stations.findIndex(st => st.id === stationID);
        if (index === -1) {
            return res.status(404).send('Станція не знайдена');
        }
        stations[index] = Object.assign(Object.assign({}, stations[index]), req.body);
        writeStationsToFile(stations);
        res.send(stations[index]);
    }
    catch (error) {
        console.error('Внутрішня помилка сервера при оновленні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});
app.get("/stations/:id/metrics", (req, res) => {
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
        }
        else {
            lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
            lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
            lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);
            res.send({
                temperature: lastTemperatureValue,
                dose_rate: lastDoseRateValue,
                humidity: lastHumidityValue
            });
        }
    }
    catch (error) {
        console.error('Внутрішня помилка сервера при отриманні метрик станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});
app.listen(port, () => {
    console.log(`now listening on port ${port}`);
});
//# sourceMappingURL=index.js.map