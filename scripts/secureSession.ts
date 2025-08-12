/**
 * ===============================================================
 *  Dự án: EFB - English For Beginners
 *  Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 *  Người dùng: Người mới bắt đầu học tiếng Anh.
 *  Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 *  Công nghệ: React Native, Expo, Firebase.
 *  Tác giả: [NHÓM EFB]
 *  Ngày tạo: 01/06/2025
 * ===============================================================
 *
 *  File: scripts/secureSession.ts
 *  Nhiệm vụ: Quản lý phiên đăng nhập (session) ở phía client một cách an toàn
 *  bằng Expo SecureStore. Bao gồm:
 *   - Lưu thông tin phiên (saveSession)
 *   - Đọc thông tin phiên (getSession)
 *   - Xoá thông tin phiên (clearSession)
 *
 *  Ghi chú bảo mật & vận hành:
 *   - SecureStore dùng Keychain (iOS) / EncryptedSharedPreferences (Android)
 *     để mã hoá dữ liệu ở mức hệ thống => an toàn hơn AsyncStorage.
 *   - Trên web (Expo Web) SecureStore KHÔNG được hỗ trợ; nếu build web,
 *     bạn cần cơ chế fallback (ví dụ: cookies/httpOnly phía server). Ở file này
 *     CHƯA triển khai fallback để giữ nguyên logic hiện có.
 *   - Chỉ lưu những dữ liệu cần thiết cho UI (uid, email, role). Token nhạy cảm
 *     (ID token/refresh token) nên để Firebase SDK tự quản lý.
 *   - KEY cố định 'user_session' để thống nhất vị trí lưu.
 *   - Tất cả API đều async để không block UI thread.
 */

// Import toàn bộ API của SecureStore dưới namespace "SecureStore".
// Expo SecureStore cung cấp các hàm setItemAsync/getItemAsync/deleteItemAsync
// để lưu/đọc/xoá dữ liệu đã mã hoá ở tầng hệ điều hành.
import * as SecureStore from 'expo-secure-store';

// Khoá (key) duy nhất dùng để lưu trữ blob JSON phiên người dùng trong SecureStore.
// Lưu ý: Đổi KEY sẽ khiến app không còn đọc được session cũ (coi như đăng xuất).
const KEY = 'user_session';

// Kiểu dữ liệu mô tả phiên người dùng (session) được app lưu trữ local.
// - uid: định danh người dùng trong Firebase Auth (bắt buộc).
// - email: có thể null nếu tài khoản không có email (ví dụ đăng nhập ẩn danh).
// - role: vai trò người dùng; hiện hỗ trợ 'admin' | 'premium' | 'user' | 'maxpremium'
//         và mở rộng bằng string để tương thích với tương lai (RBAC linh hoạt).
export type SessionData = {
  uid: string;
  email: string | null;
  role: 'admin' | 'premium' | 'user' |'maxpremium'| string;
};

/**
 * saveSession
 * ------------------------------------------------------------------
 * Mục đích:
 *   Nhận vào một đối tượng SessionData và lưu nó xuống SecureStore
 *   dưới dạng chuỗi JSON (stringify). Dùng khi người dùng đăng nhập
 *   thành công hoặc cần cập nhật role/email/uid cục bộ.
 *
 * Tham số:
 *   - data: SessionData — thông tin phiên hợp lệ.
 *
 * Hành vi:
 *   - Gọi SecureStore.setItemAsync với KEY cố định và payload JSON.
 *   - Không return dữ liệu; nếu cần kiểm tra lỗi, hãy catch ở nơi gọi.
 *
 * Lưu ý:
 *   - Hàm là async; nên await khi gọi để đảm bảo lưu xong trước khi điều hướng.
 *   - Chỉ lưu dữ liệu "không nhạy cảm" cần cho UI. Token hãy để Firebase quản lý.
 */
export async function saveSession(data: SessionData) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(data));
}

/**
 * getSession
 * ------------------------------------------------------------------
 * Mục đích:
 *   Truy xuất session đã lưu từ SecureStore và parse về object.
 *
 * Kiểu trả về (generic T):
 *   - Mặc định: Promise<SessionData | null>.
 *   - Có thể truyền kiểu T tuỳ biến nếu bạn mở rộng cấu trúc session
 *     ở tương lai (giữ tương thích ngược).
 *
 * Hành vi:
 *   - Đọc raw string bằng SecureStore.getItemAsync(KEY).
 *   - Nếu tồn tại => JSON.parse và trả về object.
 *   - Nếu chưa có => trả về null (đang đăng xuất / chưa thiết lập).
 *
 * Lưu ý:
 *   - JSON.parse có thể ném lỗi nếu dữ liệu hỏng; ở phiên bản này
 *     giữ nguyên logic (không try/catch) để không thay đổi hành vi.
 *     Nếu muốn robust hơn, hãy bọc try/catch tại nơi gọi.
 */
export async function getSession<T = SessionData>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * clearSession
 * ------------------------------------------------------------------
 * Mục đích:
 *   Xoá toàn bộ session đang lưu trong SecureStore. Dùng khi người dùng
 *   chủ động đăng xuất, khi token hết hạn và cần buộc đăng xuất, hoặc
 *   khi muốn "reset" trạng thái cục bộ.
 *
 * Hành vi:
 *   - Gọi SecureStore.deleteItemAsync(KEY).
 *   - Không return dữ liệu.
 *
 * Lưu ý:
 *   - Nên gọi thêm các thao tác dọn dẹp khác ở nơi sử dụng
 *     (ví dụ: xoá cache, reset state, điều hướng về màn hình Login).
 */
export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY);
}
