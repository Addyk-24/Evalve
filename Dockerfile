FROM python:3.13.1

WORKDIR /app


# Install Python deps
COPY requirements.txt /app/.
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY conversation_mem /app/conversation_mem
COPY database /app/database
COPY evalve /app/evalve
COPY memory /app/memory
COPY system_prompt /app/system_prompt


# Expose backend port
EXPOSE 8000

# Run backend (FastAPI as example)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
