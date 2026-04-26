#!/bin/bash

set -e

echo "🚀 NetFix Docker & Kafka Quick Start"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Offer menu
echo "What would you like to do?"
echo "1) Start all services (Zookeeper, Kafka, App)"
echo "2) Start only Kafka services (for local development)"
echo "3) Stop all services"
echo "4) View logs"
echo "5) Run Kafka consumer"
echo "6) Monitor Kafka topics"
echo ""

read -p "Enter option (1-6): " option

case $option in
    1)
        echo ""
        echo "🐳 Starting all services with Docker Compose..."
        docker-compose up -d
        echo ""
        echo "✓ Services started!"
        echo ""
        echo "📍 Access your app at: http://localhost:3000"
        echo "📍 Kafka: localhost:9092"
        echo "📍 Zookeeper: localhost:2181"
        echo ""
        echo "View logs with: docker-compose logs -f app"
        ;;
    2)
        echo ""
        echo "🐳 Starting Kafka services only..."
        docker-compose up -d kafka zookeeper
        echo ""
        echo "✓ Kafka and Zookeeper started!"
        echo ""
        echo "Start the app with: pnpm dev"
        echo "Monitor topics with: docker-compose exec kafka kafka-console-consumer --topic netfix-diagnostics --bootstrap-server localhost:9092"
        ;;
    3)
        echo ""
        echo "🛑 Stopping all services..."
        docker-compose down
        echo "✓ Services stopped!"
        ;;
    4)
        echo ""
        echo "📋 Showing application logs..."
        docker-compose logs -f app
        ;;
    5)
        echo ""
        echo "📡 Starting Kafka consumer..."
        echo "This will log all events to ./logs/"
        echo ""
        npx ts-node scripts/kafka-consumer.ts
        ;;
    6)
        echo ""
        echo "📊 Monitoring Kafka topic: netfix-diagnostics"
        echo "Press Ctrl+C to stop"
        echo ""
        docker-compose exec kafka kafka-console-consumer \
            --topic netfix-diagnostics \
            --bootstrap-server localhost:9092 \
            --from-beginning
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
