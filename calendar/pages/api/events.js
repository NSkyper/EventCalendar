let events = []; // เก็บข้อมูลตัวอย่าง

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(events); // ส่งรายการ Events ทั้งหมดกลับ
  } else if (req.method === "POST") {
    const { title, start, end } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newEvent = {
      id: events.length + 1,
      title,
      start,
      end,
    };

    events.push(newEvent);
    res.status(201).json(newEvent); // ส่ง Event ใหม่กลับ
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
