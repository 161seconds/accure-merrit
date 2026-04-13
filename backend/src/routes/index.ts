import { Router } from 'express';
import usersRouter from '~/routes/users.routes';
import karmaRouter from '~/routes/karma.routes';
import wishRouter from '~/routes/wish.routes';
import woodenFishRouter from '~/routes/woodenfish.routes';
import mediasRouter from '~/routes/medias.routes';
import staticRouter from '~/routes/static.routes';

const router = Router();

// Định nghĩa các prefix cho route
router.use('/users', usersRouter);
router.use('/karma', karmaRouter);
router.use('/wishes', wishRouter);
router.use('/wooden-fish', woodenFishRouter);
router.use('/medias', mediasRouter);
router.use('/static', staticRouter);

export default router;