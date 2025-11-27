// types/admin/studyMaterial.ts

// CEFR levels
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Loại tài liệu (đang dùng ở admin)
export type StudyMaterialType = 'pdf' | 'word';

// Nếu sau này muốn dùng riêng:
export type StudyMaterialLevel = CEFR | 'ALL';

// Cấu trúc 1 tài liệu học tập trong Firestore
export type StudyMaterial = {
  // Firestore id để bên ngoài map thêm: { id, ...data }
  title: string;
  description?: string | null;

  // CEFR level
  level?: StudyMaterialLevel;

  // Loại file (admin đang filter theo)
  type?: StudyMaterialType;

  // Trường cũ khi còn dùng Cloudinary URL
  url?: string | null;

  // Trường mới: lưu nội dung text tài liệu
  content?: string;

  // Tag để search/filter
  tags?: string[];

  // Timestamps Firestore
  createdAt?: any;
  updatedAt?: any;
};
