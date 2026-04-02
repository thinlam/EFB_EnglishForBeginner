import React, { FC } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { rulesModalStyles as S } from '@/components/style/caro';

type Props = {
    visible: boolean;// hiển thị modal hay không
    onStart: () => void;// hàm gọi khi nhấn bắt đầu chơi
    onExit: () => void;// hàm gọi khi nhấn thoát
};

export const RulesModal: FC<Props> = ({ visible, onStart, onExit }) => {
    if (!visible) return null;
    return (
    <Modal visible transparent animationType="fade">
      <View style={S.backdrop}>
        <View style={S.card}>
          <Text style={S.title}>Luật & Thể lệ</Text>
          <ScrollView contentContainerStyle={{ paddingVertical: 6 }}>
            <Text style={S.item}>• Bạn là <Text style={S.bold}>X</Text>, Bot là <Text style={S.bold}>O</Text>. Bot đi trước.</Text>
            <Text style={S.item}>• Chọn ô ⟶ trả lời 1 câu hỏi tiếng Anh trong <Text style={S.bold}>15 giây</Text>.</Text>
            <Text style={S.item}>• Trả lời <Text style={S.bold}>đúng</Text> ⟶ đặt được quân X. Sai/hết giờ ⟶ <Text style={S.bold}>bỏ lượt</Text>, hệ thống đặt X ngẫu nhiên và chuyển lượt Bot.</Text>
            <Text style={S.item}>• Thắng khi có <Text style={S.bold}>5 quân liên tiếp</Text> theo hàng/ngang/chéo.</Text>
            <Text style={S.item}>• Cuối ván: chấm <Text style={S.bold}>★</Text> & tính EXP theo độ chính xác và streak đúng.</Text>
          </ScrollView>

          <View style={S.row}>
            <TouchableOpacity onPress={onExit} style={[S.btn, S.btnGhost]}>
              <Text style={[S.btnText, S.ghostText]}>Thoát</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onStart} style={[S.btn, S.btnPrimary]}>
              <Text style={S.btnText}>Bắt đầu chơi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};