# 🎮 Game Caro (Gomoku)

> Một game **Caro (Gomoku)** chạy trên trình duyệt với 2 chế độ: **2 người (PvP)** và **đấu với máy (AI)**.

<p align="center">
  <img alt="Caro Banner" src="https://img.shields.io/badge/Gomoku-Caro-brown?style=for-the-badge" />
  <img alt="Made with" src="https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=000" />
  <img alt="UI" src="https://img.shields.io/badge/UI-HTML%20%2B%20CSS-0ea5e9?style=for-the-badge" />
</p>

---

## ✨ Giới thiệu

**Caro (Gomoku)** là trò chơi đặt quân **X/O** trên bàn cờ. Người chơi nào tạo được **5 quân liên tiếp** theo hàng ngang, dọc hoặc chéo sẽ chiến thắng.

Trong dự án này:
- ✅ Bàn cờ mặc định: **15×15**
- ✅ Điều kiện thắng: **5 quân liên tiếp**
- ✅ Chế độ chơi: **2 người (pvp)** hoặc **đấu với m��y (ai)**
- ✅ Highlight đường thắng
- ✅ Nút chơi lại

---

## 🖼️ Demo / Ảnh

Repo hiện chưa có ảnh chụp màn hình. Bạn có thể thêm bằng cách:
1) Chụp màn hình khi game đang chạy
2) Lưu vào thư mục `assets/` (ví dụ `assets/demo.png`)
3) Chèn vào README:

```md
![Demo](assets/demo.png)
```

---

## 🚀 Cách chạy

Vì đây là dự án **HTML/CSS/JS thuần**, bạn có thể chạy theo 2 cách:

### Cách 1: Mở trực tiếp file (nhanh nhất)
- Mở `index.html` bằng trình duyệt (Chrome/Edge/Firefox).

### Cách 2: Chạy qua server (khuyên dùng nếu bạn muốn ổn định hơn)
Ví dụ với VS Code:
- Cài extension **Live Server**
- Chuột phải `index.html` → **Open with Live Server**

---

## 🗂️ Cấu trúc thư mục

```text
Game-Caro/
├─ index.html      # Giao diện chính
├─ style.css       # Style UI + bàn cờ
├─ script.js       # Logic game + AI
└─ README.md
```

---

## 🧠 Giải thích chi tiết code

### 1) Giao diện (UI) — `index.html`

Các thành phần chính:
- `#board`: nơi render bàn cờ (grid 15×15)
- `#status`: hiển thị lượt chơi / thông báo thắng / hòa
- `#modeSelect`: chọn **2 người** hoặc **AI**
- `#resetBtn`: chơi lại

Điểm hay:
- Bàn cờ không viết sẵn 225 ô trong HTML, mà **JS sẽ tạo** tự động bằng `createBoard()`.

---

### 2) CSS Layout + bàn cờ — `style.css`

CSS dùng biến màu trong `:root` để dễ chỉnh theme:
- `--x` (màu quân X)
- `--o` (màu quân O)
- `--line` (màu đường kẻ bàn cờ)

Bàn cờ dùng CSS Grid:
- `.board` đặt `--size: 15` và `--cell` để tính kích thước
- `.cell` là từng ô, hiển thị chữ X/O

Highlight đường thắng:
- `.cell.win { background: ... }`

---

### 3) Logic game — `script.js`

#### 3.1 Hằng số & trạng thái
- `BOARD_SIZE = 15`
- `NEED_TO_WIN = 5`
- `board`: mảng 2 chiều lưu trạng thái quân cờ
- `currentPlayer`: người chơi hiện tại (`"X"` hoặc `"O"`)
- `gameMode`: `"pvp"` hoặc `"ai"`
- `gameOver`: kết thúc ván
- `aiThinking`: chặn click khi máy đang tính

#### 3.2 Tạo bàn cờ — `createBoard()`
- Khởi tạo `board` dạng `15x15` rỗng
- Xóa HTML cũ và tạo 225 nút `<button class="cell">`
- Gán `data-row`, `data-col` để biết tọa độ
- Reset trạng thái game và status: `Luot: X`

#### 3.3 Kiểm tra biên — `inBounds(row, col)`
Đảm bảo không truy cập ra ngoài mảng khi duyệt theo hướng.

#### 3.4 Đếm quân theo 1 hướng — `countInDirection(...)`
Từ một ô, đi theo vector `(dRow, dCol)` để đếm số quân liên tiếp của cùng `player`.

#### 3.5 Kiểm tra thắng — `hasWinAt(row, col, player)`
Kiểm tra 4 hướng chính:
- ngang `[0,1]`
- dọc `[1,0]`
- chéo chính `[1,1]`
- chéo phụ `[1,-1]`

Công thức:
- `connected = 1 + countForward + countBackward`
- nếu `connected >= 5` ⇒ thắng

#### 3.6 Lấy danh sách ô thắng — `getWinningCells(...)`
Giống kiểm tra thắng nhưng thay vì trả `true/false` thì trả về mảng tọa độ các ô liên tiếp, dùng để highlight.

#### 3.7 Highlight đường thắng — `markWinningCells(cells)`
Map từ `(row,col)` sang index trong DOM: `index = row * BOARD_SIZE + col`, rồi add class `win`.

#### 3.8 Đi nước — `placeMove(row, col, player)`
- Cập nhật `board[row][col]`
- Update DOM: set `textContent = X/O` và add class `x` hoặc `o`

#### 3.9 Kết thúc lượt — `finishTurn(row, col, player)`
- Nếu thắng: set `gameOver = true`, highlight, status: `Nguoi choi X thang!`
- Nếu hòa: status: `Hoa co!`
- Nếu chưa kết thúc: đổi `currentPlayer`
- Nếu đang ở chế độ AI và tới lượt O: gọi `queueAiMove()`

---

## 🤖 AI hoạt động như thế nào?

AI trong game này là dạng **heuristic (chấm điểm nước đi)**, không phải minimax, nên chạy nhanh.

### Bước 1: Lọc nước đi ứng viên — `getCandidateMoves()`
- Nếu bàn cờ rỗng ⇒ đánh giữa bàn (`center`)
- Nếu có quân ⇒ chỉ xét các ô trống **có hàng xóm trong bán kính 2 ô** (`hasNeighbor`) để giảm số nước cần tính

### Bước 2: Ưu tiên thắng / chặn thắng
Trong `findBestMove()`:
1) Nếu có nước đi giúp AI thắng ngay (`wouldWin(..., AI_PLAYER)`) ⇒ chọn
2) Nếu người chơi sắp thắng (`wouldWin(..., HUMAN_PLAYER)`) ⇒ chặn

### Bước 3: Chấm điểm tấn công + phòng thủ
- `attack = evaluateCell(..., AI)`
- `defense = evaluateCell(..., HUMAN)`
- Thêm `centerBonus` để AI ưu tiên gần trung tâm
- Score cuối: `attack * 1.2 + defense + centerBonus`

### Độ trễ “nghĩ”
`queueAiMove()` dùng `setTimeout(..., 220)` để tạo cảm giác máy đang tính.

---

## 🔁 Reset / Chuyển chế độ

- Reset: `resetBtn.addEventListener('click', createBoard)`
- Đổi chế độ: `modeSelect.addEventListener('change', ...)` → set `gameMode` rồi `createBoard()`

---

## 🛠️ Các điểm có thể cải tiến

- ✅ Thêm chọn kích thước bàn (10x10, 15x15, 19x19)
- ✅ Thêm luật chặn 2 đầu (Renju) / luật nâng cao
- ✅ Làm AI mạnh hơn bằng **Minimax + Alpha-Beta pruning** (kèm giới hạn độ sâu)
- ✅ Thêm âm thanh, animation đặt quân
- ✅ Thêm lưu lịch sử nước đi (Undo/Redo)
- ✅ Thêm chế độ online (WebSocket)
- ✅ Tối ưu performance khi render (virtualization) nếu tăng kích thước bàn

---

## 📄 License
