# server launch

if ! command -v ts-node &> /dev/null; then
  echo "ts-node not found, installing..."
  npm install -g ts-node typescript @types/node
fi

(
  cd "$(dirname "$0")" && ts-node ../src/server.ts || exit 1
) &

(
  cd client && npm run dev
) &
wait