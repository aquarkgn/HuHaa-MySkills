#!/bin/bash

# HuHaa-MySkills 智能启动脚本 - 真正的后台启动
# 功能：后台启动，自动处理端口占用，重启本服务或切换端口

DEFAULT_PORT=11522
PORT=$DEFAULT_PORT
MAX_ATTEMPTS=5
ATTEMPT=0

# 检查端口是否被占用
check_port() {
  lsof -i :$1 >/dev/null 2>&1
  return $?
}

# 获取占用端口的进程信息
get_process_info() {
  lsof -ti :$1 2>/dev/null | head -1
}

# 检查是否为本服务进程
is_our_process() {
  pid=$1
  if [ -z "$pid" ]; then return 1; fi
  ps -p $pid 2>/dev/null | grep -E "huhaa-myskills|node.*bin" >/dev/null 2>&1
  return $?
}

# 日志文件
LOG_FILE="/tmp/huhaa-myskills-dev.log"

# 重启本服务进程
restart_service() {
  local port=$1
  local pid=$(get_process_info $port)
  {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restarting HuHaa-MySkills on port $port (PID: $pid)..."
    kill -9 $pid 2>/dev/null
    sleep 1
    cd /Users/mac/Project/HuHaa-MySkills
    npm run start >/dev/null 2>&1 &
    sleep 2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ Service restarted on port $port"
  } >> $LOG_FILE 2>&1
  exit 0
}

# 启动新服务
start_service() {
  local port=$1
  {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting HuHaa-MySkills on port $port..."
    cd /Users/mac/Project/HuHaa-MySkills
    npm run start >/dev/null 2>&1 &
    sleep 2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ Service started in background on port $port"
  } >> $LOG_FILE 2>&1
  exit 0
}

# 主逻辑（后台运行）
{
  while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if check_port $PORT; then
      # 端口被占用
      pid=$(get_process_info $PORT)
      if is_our_process $pid; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ Our service already running on port $PORT (PID: $pid)"
        restart_service $PORT
      else
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ Port $PORT occupied by other process (PID: $pid)"
        PORT=$((PORT + 1))
        ATTEMPT=$((ATTEMPT + 1))
        echo "  Trying port $PORT..."
      fi
    else
      # 端口空闲
      start_service $PORT
    fi
  done

  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✗ Failed to start: no available ports" >> $LOG_FILE
} >> $LOG_FILE 2>&1 &

# 立即返回（真正的后台运行）
echo "HuHaa-MySkills 启动中... (日志: $LOG_FILE)"
exit 0

