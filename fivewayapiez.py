Yes, these are the main ways to handle API inputs in FastAPI:

1. Path Parameters (/items/{id}) → Required in URL


2. Query Parameters (/items?name=laptop) → Optional in URL


3. Request Body (JSON in POST, PUT) → Sent in request body


4. Header & Cookie Parameters (Less common, but useful)



Let me quickly explain Header & Cookie Parameters as a bonus:


---

5️⃣ Header Parameters (Passing Data in Headers)

Useful for authentication (Authorization), API keys, etc.

Example: Get User Agent from Headers

from fastapi import Header

@app.get("/headers")
async def get_headers(user_agent: str = Header(None)):
    return {"User-Agent": user_agent}

✅ Example Request:

GET /headers (with User-Agent: Mozilla/5.0 in headers)

Response: {"User-Agent": "Mozilla/5.0"}



---

6️⃣ Cookie Parameters (Managing Sessions)

Used for authentication/session tracking.

Example: Read Cookies

from fastapi import Cookie

@app.get("/read-cookie")
async def read_cookie(session_id: str = Cookie(None)):
    return {"session_id": session_id}

✅ Example:

Browser sends Cookie: session_id=abc123

Response: {"session_id": "abc123"}



---

🔥 Final Summary

✅ Path Parameters → /items/{id} (Dynamic in URL)
✅ Query Parameters → /items?name=xyz (Filters & Sorting)
✅ Request Body → JSON in POST/PUT requests
✅ Header Parameters → Auth, API Keys, Metadata
✅ Cookie Parameters → Sessions & Tracking

So, not just 3, but 5 ways to pass data in FastAPI APIs!

Which one do you want to dive deeper into next? 🚀

