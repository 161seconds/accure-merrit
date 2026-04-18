import { Request, Response } from 'express';
import Mission from '../models/missionsModel';

export const getMissions = async (req: Request, res: Response) => {
    try {
        const missions = await Mission.find({});
        res.status(200).json(missions);
    } catch (error) {
        console.error("Lỗi khi lấy nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi server, không thể lấy dữ liệu nhiệm vụ" });
    }
};