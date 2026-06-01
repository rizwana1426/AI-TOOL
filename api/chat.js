export default async function handler(req, res) {
    const { whoAmI, writingTo, whatIWant } = req.body;

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{
                        role: 'user',
                        content: `Write a professional email with these details:
- I am: ${whoAmI}
- Writing to: ${writingTo}
- My purpose: ${whatIWant}

Rules:
- Start with Subject:
- Professional tone
- No indentation`,
                    }, ],
                }),
            }
        );

        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}