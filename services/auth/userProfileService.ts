// services/auth/userProfileService.ts
import { db } from '@/scripts/firebase';
import type { UserDoc } from '@/types/auth/user';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

/** Chuẩn hoá email: trim + lowercase */
export const normalizeEmail = (s: string) => s.trim().toLowerCase();

/** Tạo Error luôn có .code để UI bắt theo code thay vì log "undefined ..." */
export function makeLoginError(code: string, message?: string) {
  const err = new Error(message ?? code) as any;
  err.code = code;
  return err;
}

/**
 * Đảm bảo users/{uid} tồn tại & đúng UID:
 * - Nếu chưa có: tìm doc lạc theo email → migrate về {uid}
 * - Nếu không có doc nào: tạo mới
 * - Nếu đã có: merge "extra" và cập nhật updatedAt
 * Trả về dữ liệu hồ sơ sau khi đảm bảo tồn tại.
 */
export async function ensureUserProfile(
  uid: string,
  email: string | null,
  extra?: Partial<UserDoc>
) {
  const uidRef = doc(db, 'users', uid);
  let snap = await getDoc(uidRef);

  if (!snap.exists()) {
    const emailNorm = email ? normalizeEmail(email) : '';

    // Tìm doc lệch UID theo email
    let migrated = false;
    if (emailNorm) {
      const q = query(collection(db, 'users'), where('email', '==', emailNorm), limit(1));
      const rs = await getDocs(q);

      if (!rs.empty) {
        const wrong = rs.docs[0];
        const wrongData = wrong.data() as Partial<UserDoc>;

        await runTransaction(db, async (tx) => {
          // Ưu tiên extra > wrongData để không mất thông tin mới
          const payload: Partial<UserDoc> = {
            ...wrongData,
            ...extra,
            email: emailNorm,
          };
          if (!(wrongData as any)?.createdAt) {
            (payload as any).createdAt = serverTimestamp() as any;
          }
          (payload as any).updatedAt = serverTimestamp() as any;

          tx.set(uidRef, payload, { merge: true });
          tx.delete(doc(db, 'users', wrong.id)); // dọn doc cũ
        });

        snap = await getDoc(uidRef);
        migrated = true;
      }
    }

    if (!migrated) {
      const base: Partial<UserDoc> = {
        name: '',
        // GỢI Ý: nếu bạn có name khi đăng ký, hãy nhớ set cả nameLower để tra nhanh
        // nameLower: (extra?.name ?? '').trim().toLowerCase(),
        email: email ? normalizeEmail(email) : '',
        number: '',
        role: 'user' as any,
        level: null as any,
        startMode: null as any,
        createdAt: serverTimestamp() as any,
        ...extra,
      };
      // nếu có name thì auto set nameLower
      if (base.name && !(base as any).nameLower) {
        (base as any).nameLower = (base.name as string).trim().toLowerCase();
      }
      await setDoc(uidRef, base, { merge: true });
      snap = await getDoc(uidRef);
    }
  } else if (extra && Object.keys(extra).length > 0) {
    // Doc đã tồn tại: merge "extra" nếu khác
    const prev = snap.data() as any;
    const updates: Record<string, any> = {};
    let needUpdate = false;

    for (const k of Object.keys(extra)) {
      const v = (extra as any)[k];
      if (v !== undefined && prev[k] !== v) {
        updates[k] = v;
        needUpdate = true;
        if (k === 'name') {
          updates.nameLower = (v as string).trim().toLowerCase();
        }
      }
    }
    if (email && normalizeEmail(prev.email ?? '') !== normalizeEmail(email)) {
      updates.email = normalizeEmail(email);
      needUpdate = true;
    }

    if (needUpdate) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(uidRef, updates);
      snap = await getDoc(uidRef);
    }
  }

  return (snap.data() || {}) as UserDoc;
}

/**
 * Tra "name" → email, ưu tiên các field lowercase:
 * - where('nameLower', '==', nameLower)
 * - (fallback) where('name_lower', '==', nameLower)
 * - (fallback) where('name', '==', nameLower)  // dành cho DB lưu name đã lowercase
 * - (fallback cuối) where('name', '==', rawName) // nếu DB lưu name viết hoa/thường tuỳ ý
 *
 * Lưu ý: Firestore không hỗ trợ truy vấn không phân biệt hoa/thường, nên tốt nhất
 * hãy luôn lưu thêm field 'nameLower' khi đăng ký/cập nhật hồ sơ.
 */
export async function resolveEmailFromUsername(rawName: string) {
  const nameLower = rawName.trim().toLowerCase();
  const tryQueries = [
    where('nameLower', '==', nameLower),
    where('name_lower', '==', nameLower),
    where('name', '==', nameLower),
    where('name', '==', rawName.trim()),
  ];

  let hit: UserDoc | null = null;

  for (const cond of tryQueries) {
    const q = query(collection(db, 'users'), cond, limit(1));
    const rs = await getDocs(q);
    if (!rs.empty) {
      hit = rs.docs[0].data() as UserDoc;
      break;
    }
  }

  if (!hit) throw makeLoginError('USERNAME_NOT_FOUND', 'USERNAME_NOT_FOUND');

  const email = (hit.email ?? '').toString().trim();
  if (!email) throw makeLoginError('USERNAME_HAS_NO_EMAIL', 'USERNAME_HAS_NO_EMAIL');

  return normalizeEmail(email);
}
