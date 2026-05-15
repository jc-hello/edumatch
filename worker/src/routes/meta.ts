import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok } from '../lib/response';

const meta = new Hono<AppContext>();

meta.get('/subjects', (c) =>
  ok(c, ['Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'Ngữ văn', 'Tin học', 'IELTS', 'TOEIC']),
);

meta.get('/levels', (c) => ok(c, ['THCS', 'THPT', 'Đại học', 'Người đi làm']));

meta.get('/banks', (c) =>
  ok(c, [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'MB', name: 'MB Bank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'VTB', name: 'VietinBank' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'SHB', name: 'SHB' },
    { code: 'MSB', name: 'MSB' },
  ]),
);

export default meta;
