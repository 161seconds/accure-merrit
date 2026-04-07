require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import 4 Models
const User = require('./models/User');
const KarmaLog = require('./models/KarmaLog');
const Donation = require('./models/Donation');
const UserMission = require('./models/UserMission');

const app = express();
app.use(express.json());
app.use(cors());

// ══════════════ KẾT NỐI MONGODB ══════════════
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✦ Chân Nguyên Đã Tụ: Kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối Database:', err));

// ══════════════ API KHỞI TẠO (CŨ) ══════════════
app.get('/init-db', async (req, res) => {
    try {
        let user = await User.findOne({ username: '161seconds' });
        if (!user) {
            user = new User({
                username: '161seconds',
                password: '123',
                name: 'Bảo Demo',
                stats: { ducTotal: 3667, toiTotal: 25, moCount: 150, streak: 7 }
            });
            await user.save();
        }
        res.send('Đã khởi tạo Database hoàn chỉnh! Hãy mở MongoDB Compass để kiểm tra.');
    } catch (error) {
        res.status(500).send('Lỗi: ' + error.message);
    }
});

// ══════════════ API ĐĂNG KÝ ══════════════
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;

        const exists = await User.findOne({ username });
        if (exists) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại!' });
        }

        const newUser = new User({
            username: username,
            password: password,
            name: name || username,
            avatar: '☸',
            stats: {
                ducTotal: 0,
                toiTotal: 0,
                moCount: 0,
                streak: 0
            },
            settings: { equippedTitleId: 't1' }
        });

        await newUser.save();
        res.json({ message: 'Đăng ký thành công!', user: newUser });

    } catch (err) {
        console.error("Lỗi Đăng Ký:", err);
        res.status(400).json({ error: 'Lỗi Database: ' + err.message });
    }
});

// ══════════════ API ĐĂNG NHẬP ══════════════
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });
        if (!user) return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu!' });

        res.json({ message: 'Đăng nhập thành công!', user });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server: ' + err.message });
    }
});

// ══════════════ API ĐỒNG BỘ ĐIỂM SỐ ══════════════
app.post('/api/sync', async (req, res) => {
    try {
        const { username, stats } = req.body;

        const user = await User.findOneAndUpdate(
            { username },
            { $set: { stats: stats } },
            { returnDocument: 'after' }
        );

        if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
        res.json({ message: 'Đã lưu điểm lên mây!', user });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server: ' + err.message });
    }
});

// ══════════════ KHỞI ĐỘNG SERVER ══════════════
const PORT = 5000;
// ══════════════ API BƠM DỮ LIỆU QUYÊN GÓP MẪU VÀO DB ══════════════
app.get('/seed-donors', async (req, res) => {
    try {
        const donators = [
            { donorName: 'Nguyễn Thị Lan 🌸', message: 'Nam mô A Di Đà Phật, cầu bình an cho gia đình', amount: 200000 },
            { donorName: 'Trần Minh Đức', message: 'Tâm bố thí, phúc vô lượng', amount: 100000 },
            { donorName: 'Phạm Thị Hoa 🌺', message: 'Hồi hướng công đức cho chúng sinh', amount: 500000 },
            { donorName: 'Lê Văn An', message: '', amount: 50000 },
            { donorName: 'Võ Thị Mai', message: 'Cầu mọi chúng sinh đều được an lạc', amount: 100000 }
        ];

        // Xóa dữ liệu cũ (nếu có) và bơm mảng trên vào bảng Donation
        await Donation.deleteMany({});
        await Donation.insertMany(donators);

        res.send('✦ Đã bơm thành công danh sách Quyên Góp vào Database!');
    } catch (err) {
        res.status(500).send('Lỗi: ' + err.message);
    }
});

// ══════════════ API LẤY DANH SÁCH QUYÊN GÓP LÊN WEB ══════════════
app.get('/api/donations', async (req, res) => {
    try {
        // Lấy danh sách từ DB, sắp xếp mới nhất lên đầu
        const donations = await Donation.find().sort({ createdAt: -1 });

        // Tự động tính tổng số tiền mọi người đã quyên góp
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

        res.json({
            donations: donations.slice(0, 10), // Chỉ trả về 10 người mới nhất cho nhẹ web
            totalAmount: totalAmount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════ KHỞI TẠO BẢNG DỮ LIỆU HỆ THỐNG (MASTER DATA) ══════════════
// Tạo Model ngay trong này cho tiện, khỏi cần thêm file
const Mission = mongoose.model('Mission', new mongoose.Schema({
    id: String, icon: String, name: String, desc: String, pts: Number, streakBonus: Boolean,
    isChain: { type: Boolean, default: false }, chainDays: Number
}));

const Title = mongoose.model('Title', new mongoose.Schema({
    id: String, icon: String, name: String, desc: String, req: Number,
    isLimited: { type: Boolean, default: false }, reqText: String
}));

// 1. API LẤY DANH SÁCH NHIỆM VỤ CỦA USER HÔM NAY
app.get('/api/user-missions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const today = new Date().toISOString().split('T')[0]; // VD: "2026-04-05"

        // Câu Aggregation ta đã viết ở trên
        // Trong server.js -> API /api/user-missions/:userId
        const userKanban = await UserMission.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), date: today } },
            { $unwind: "$kanban" },
            {
                $lookup: {
                    from: "missions",
                    localField: "kanban.missionId",
                    foreignField: "id",
                    as: "mission_detail"
                }
            },
            { $unwind: "$mission_detail" },
            {
                $group: {
                    _id: "$_id",
                    date: { $first: "$date" },
                    tasks: {
                        $push: {
                            id: "$kanban.missionId",
                            status: "$kanban.status",
                            name: "$mission_detail.name",
                            desc: "$mission_detail.description",
                            pts: "$mission_detail.pts",
                            icon: "$mission_detail.icon",
                            streakBonus: "$mission_detail.streakBonus"
                        }
                    }
                }
            }
        ]);

        if (!userKanban || userKanban.length === 0) {
            return res.json({ tasks: [] });
        }
        res.json({ tasks: userKanban[0].tasks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. API CẬP NHẬT TRẠNG THÁI KHI KÉO THẢ KANBAN
app.post('/api/user-missions/update-status', async (req, res) => {
    try {
        const { userId, missionId, status } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Cập nhật lại status của 1 mission cụ thể trong mảng kanban
        await UserMission.updateOne(
            { userId: userId, date: today, "kanban.missionId": missionId },
            { $set: { "kanban.$.status": status } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ══════════════ API BƠM DATA NHIỆM VỤ & DANH HIỆU ══════════════
app.get('/seed-system', async (req, res) => {
    try {
        const missionsData = [
            { id: 'd1', icon: '🔔', name: 'Gõ mõ sáng', desc: 'Gõ 10 tiếng', pts: 30, streakBonus: true, isChain: false },
            { id: 'd2', icon: '🕯️', name: 'Thắp nhang', desc: 'Thắp & cầu nguyện', pts: 25, streakBonus: true, isChain: false },
            { id: 'd3', icon: '🪷', name: 'Ghi việc thiện', desc: '1 việc lành', pts: 20, streakBonus: true, isChain: false },
            { id: 'd4', icon: '🥗', name: 'Ăn chay', desc: '1 bữa chay', pts: 15, streakBonus: false, isChain: false },
            { id: 'd5', icon: '📿', name: 'Tụng kinh', desc: '5 phút niệm Phật', pts: 20, streakBonus: true, isChain: false },
            { id: 'd6', icon: '🤲', name: 'Giúp người khác', desc: '1 việc thiện', pts: 35, streakBonus: true, isChain: false },
            { id: 'd7', icon: '♻️', name: 'Nhặt rác', desc: 'Dọn môi trường', pts: 15, streakBonus: false, isChain: false },
            { id: 'w1', icon: '🕊️', name: 'Phóng sinh', desc: 'Mua sinh vật thả', pts: 100, streakBonus: false, isChain: false },
            { id: 'w2', icon: '🌿', name: 'Thiền định', desc: '10 phút tĩnh tâm', pts: 25, streakBonus: true, isChain: false },
            { id: 'c1', icon: '🔗', name: 'Chuỗi Thiện Tâm', desc: 'Ghi đức 7 ngày liên tiếp', pts: 200, isChain: true, chainDays: 7 },
            { id: 'c2', icon: '⛓️', name: 'Chuỗi Thanh Tịnh', desc: 'Không ghi tội 5 ngày', pts: 150, isChain: true, chainDays: 5 },
            { id: 'c3', icon: '🌊', name: 'Chuỗi Từ Bi', desc: 'Thắp nhang 14 ngày liên tiếp', pts: 300, isChain: true, chainDays: 14 }
        ];

        const titlesData = [
            { id: 't1', icon: '🌱', name: 'Thiện Nhân Sơ Cấp', desc: 'Người mới bước đầu...', req: 0, isLimited: false },
            { id: 't2', icon: '🌿', name: 'Thiện Tâm Mới Nở', desc: 'Tấm lòng thiện lành...', req: 500, isLimited: false },
            { id: 't3', icon: '🌸', name: 'Đệ Tử Thanh Tịnh', desc: 'Giữ tâm trong sạch...', req: 1000, isLimited: false },
            { id: 't4', icon: '☘️', name: 'Hành Giả Từ Bi', desc: 'Lòng từ bi lan tỏa...', req: 2000, isLimited: false },
            { id: 't5', icon: '🪷', name: 'Bồ Tát Nhân Gian', desc: 'Hóa thân Bồ Tát...', req: 3500, isLimited: false },
            { id: 't6', icon: '⭐', name: 'Bậc Đại Thiện Nhân', desc: 'Đức hạnh sáng ngời...', req: 5000, isLimited: false },
            { id: 't7', icon: '🌟', name: 'Phật Tử Chân Chánh', desc: 'Trọn vẹn trên con đường...', req: 8000, isLimited: false },
            { id: 't8', icon: '☀️', name: 'Giác Ngộ Viên Mãn', desc: 'Đạt tới cảnh giới...', req: 15000, isLimited: false },
            { id: 'l1', icon: '🔥', name: 'Hành Giả Chuỗi Lửa', desc: 'Hoàn thành 7 ngày...', reqText: 'Chuỗi 7 ngày', isLimited: true },
            { id: 'l2', icon: '🌙', name: 'Thiền Giả Đêm Trăng', desc: 'Gõ mõ lúc nửa đêm', reqText: 'Gõ mõ 0:00–1:00', isLimited: true },
            { id: 'l3', icon: '🦋', name: 'Phóng Sinh 10 Lần', desc: 'Thực hiện phóng sinh...', reqText: 'Phóng sinh ×10', isLimited: true },
            { id: 'l4', icon: '🏯', name: 'Người Hành Hương', desc: 'Thắp nhang 30 ngày...', reqText: 'Thắp nhang 30 ngày', isLimited: true },
            { id: 'l5', icon: '💎', name: 'Kim Cương Tâm', desc: 'Đạt điểm thuần dương...', reqText: '30 ngày tâm sạch', isLimited: true },
            { id: 'l6', icon: '🌈', name: 'Cầu Vồng Phúc Đức', desc: 'Hoàn thành 100 nhiệm vụ', reqText: '100 nhiệm vụ', isLimited: true }
        ];

        // Reset và nạp mới
        await Mission.deleteMany({});
        await Title.deleteMany({});
        await Mission.insertMany(missionsData);
        await Title.insertMany(titlesData);

        res.send('✦ Đã đồng bộ toàn bộ Dữ Liệu Hệ Thống lên Database!');
    } catch (err) {
        res.status(500).send('Lỗi: ' + err.message);
    }
});

// ══════════════ API XUẤT DATA CHO WEB ══════════════
app.get('/api/system-data', async (req, res) => {
    try {
        const missions = await Mission.find();
        const titles = await Title.find();
        res.json({ missions, titles });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════ API TRỢ LÝ TÂM LINH ══════════════
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên server' });
        }

        const systemPrompt = `Ngươi là một vị Thiền Sư thông thái, từ bi và đôi chút dí dỏm đang tu tập tại mây ngàn. 
        Nhiệm vụ của ngươi là tư vấn cho người dùng về luật nhân quả, cách làm việc thiện (tích đức), sám hối và giữ tâm thanh tịnh.
        - Cách xưng hô: Tự xưng là 'bần tăng', gọi người dùng là 'thí chủ'.
        - Giọng điệu: Nhẹ nhàng, thâm thúy, lồng ghép đạo lý Phật giáo nhưng rất gần gũi, hiện đại. Thỉnh thoảng dùng 'Mô Phật', 'Thiện tai'.
        - Quy tắc tối thượng: Trả lời RẤT NGẮN GỌN, súc tích (tối đa 2-3 câu ngắn) vì khung chat trên màn hình rất nhỏ.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [
                        {
                            parts: [
                                { text: message }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", data);
            throw new Error(data.error?.message || 'Lỗi từ Gemini API');
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mô Phật, bần tăng tạm thời chưa thấu hiểu ý thí chủ.";
        res.json({ reply });

    } catch (err) {
        console.error("Lỗi Server Backend:", err);
        res.status(500).json({ error: "Lỗi kết nối Trợ lý Tâm Linh: " + err.message });
    }
});
app.listen(PORT, () => {
    console.log(`✦ Máy chủ đang chạy tại: http://localhost:${PORT}`);
});