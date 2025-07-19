# Trang Tasks cho User

## Mô tả

Trang này được thiết kế cho user không phải admin để thực hiện công việc labeling. User sẽ được redirect đến trang này khi truy cập vào project mà họ được assign.

## Layout

- **Layout 2 cột**: Trái (40%) và phải (60%)
- **Cột trái**: LineItemsTable - hiển thị danh sách các mẫu cần xử lý
- **Cột phải**: SamplePreview - hiển thị chi tiết mẫu được chọn

## Tính năng chính

### 1. **Đồng bộ 2 chiều giữa Table và Preview:**

- ✅ **Từ Table → Preview**: Click nút "Xem" → SamplePreview chuyển sang sample tương ứng
- ✅ **Từ Preview → Table**: Sử dụng nút Previous/Next → LineItemsTable highlight và scroll đến row tương ứng
- ✅ **Auto-scroll**: Tự động scroll đến row được chọn trong table
- ✅ **Auto-pagination**: Tự động chuyển trang nếu sample không ở trang hiện tại
- ✅ **Visual feedback**: Loading spinner khi đang chuyển sample

### 2. **Tự động load mẫu đầu tiên:**

- Khi vào trang, mẫu đầu tiên sẽ được hiển thị
- Row đầu tiên được highlight trong table

### 3. **Chọn mẫu:**

- Click vào một dòng trong bảng để xem chi tiết mẫu đó
- Row được highlight với màu xanh và border bên trái

### 4. **Xác nhận mẫu:**

- Có thể xác nhận hoặc phê duyệt mẫu (tùy theo quyền)
- Nút "Xác nhận" và "Phê duyệt" (cho superuser)

### 5. **Chỉnh sửa tin nhắn:**

- Có thể chỉnh sửa role, think content và main content
- Dialog chỉnh sửa với preview real-time

### 6. **Responsive:**

- Hoạt động tốt trên cả desktop và mobile
- Layout tự động chuyển thành 1 cột trên mobile

## API sử dụng

- `projectsGetProjectStatus`: Lấy thông tin project
- `projectsGetLineItems`: Lấy danh sách mẫu
- `projectsGetSampleByIndex`: Lấy chi tiết mẫu theo index
- `projectsConfirmLineItem`: Xác nhận/phê duyệt mẫu

## Components tái sử dụng

- `LineItemsTable`: Từ `app/(user)/projects/[id]/_components/`
- `SamplePreview`: Từ `app/(user)/projects/[id]/_components/`
- Tất cả các sub-components của SamplePreview

## Navigation

- Nút "Quay lại" để trở về trang projects
- Breadcrumb hiển thị tên project

## Tính năng đồng bộ chi tiết

### Khi chuyển sample từ Preview

1. User click Previous/Next trong SamplePreview
2. `onSampleChange` callback được gọi với sample index mới
3. `selectedSampleIndex` trong TasksView được cập nhật
4. LineItemsTable nhận `selectedSampleIndex` mới
5. useEffect trong LineItemsTable kiểm tra:
   - Nếu sample ở trang hiện tại → scroll đến row
   - Nếu sample ở trang khác → chuyển trang và scroll
6. Row được highlight với màu xanh
7. Loading spinner hiển thị trong quá trình chuyển

### Khi chọn sample từ Table

1. User click nút "Xem" trong LineItemsTable
2. `onViewSample` callback được gọi với lineItem
3. `selectedSampleIndex` được cập nhật với `lineItem.line_index`
4. SamplePreview nhận `initialSampleIndex` mới
5. useEffect trong SamplePreview cập nhật `currentSampleIndex`
6. Query refetch với sample mới
7. Sample mới được hiển thị bên phải
