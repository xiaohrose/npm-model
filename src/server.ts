import express, { Request, Response, Router } from 'express';
import { readChats, readChatDataByFile } from './util';

const app = express();
const PORT = process.env.PORT || 3033;

app.use(express.json());

const router = Router();

router.get('/chats', async (req: Request, res: Response) => {
    try {
        const chats = readChats();
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

router.get('/chats/:file', async (req: Request, res: Response) => {
    const { file } = req.params;
    try {
        const chatData = readChatDataByFile(file);
        if (chatData.length === 0) {
            res.status(200).json([]);
        }
        res.status(200).json(chatData);
    } catch (error) {
        console.error('Error fetching chat data by file:', error);
        res.status(500).json({ error: 'Failed to fetch chat data by file' });
    }
});

app.use(router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
