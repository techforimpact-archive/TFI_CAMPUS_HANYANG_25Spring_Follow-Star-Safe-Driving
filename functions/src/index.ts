import express from "express";
import cors from "cors";
import {onRequest} from "firebase-functions/v2/https";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
// import YAML from 'yamljs';
// import * as path from "path";

import villagesRouter from "./routes/villages";
import usersRouter from "./routes/users";
import scenariosRouter from "./routes/scenarios";
import questsRouter from "./routes/quests";
import sessionsRouter from "./routes/sessions";
import attemptsRouter from "./routes/attempts";
import certificatesRouter from "./routes/certificates";
import sounddataRouter from "./routes/sounddata";

const app = express();

//const swaggerSpec = YAML.load(path.resolve(__dirname, './openapi.yaml'));

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// CORS 및 JSON 파싱 미들웨어
app.use(cors({origin: true}));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger UI

// app.get('/docs-test', (_, res) => res.send('Swagger works!'));
// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// app.use('/docs', setupSwagger);

// API 라우트
app.use("/villages", villagesRouter);
app.use("/users", usersRouter);
app.use("/scenarios", scenariosRouter);
app.use("/quests", questsRouter);
app.use("/sessions", sessionsRouter);
app.use("/sessions/:session_id/quests", attemptsRouter);
app.use("/certificates", certificatesRouter);
app.use("/sounddata", sounddataRouter);

export const api = onRequest(app);
