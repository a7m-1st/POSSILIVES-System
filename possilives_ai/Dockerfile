# Use Python 3.11 as base image
FROM python:3.11-slim AS dev

# Set working directory in the container
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files into the container
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Command to run when the container starts
CMD ["python", "main.py"]