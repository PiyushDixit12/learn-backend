import {Router} from 'express';
import {healthCheck} from "../controllers/HealthCheck.controller.js"

const router = Router();

router.route('/').get(healthCheck);

export default router