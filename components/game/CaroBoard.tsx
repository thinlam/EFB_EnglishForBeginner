import { caroBoardStyles as S } from '@/components/style/caro';
import type { Player } from '@/constants/game/caro';
import type { Board, Cell } from '@/types/game/caro';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = { board: Board; turn: Player; lastPick?: Cell | null; onCellPress: (cell: Cell)=>void; }; // onCellPress gọi khi người chơi nhấn vào ô

export const CaroBoard: React.FC<Props> = ({ board, onCellPress, lastPick }) => (
  <View style={S.grid}>
    {board.map((row, r) => (
      <View key={r} style={S.row}>
        {row.map((val, c) => {
          const isLast = lastPick && lastPick.r === r && lastPick.c === c;
          return (
            <TouchableOpacity key={c} style={[S.cell, isLast && S.cellLast]} onPress={() => onCellPress({ r, c })} activeOpacity={0.8}>
              <Text style={[S.mark, val==='X' && S.xMark, val==='O' && S.oMark]}>{val ?? ''}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ))}
  </View>
);
