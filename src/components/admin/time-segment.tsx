import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
const TimeSegmentSelector = () => {
// 30分刻みの時間枠を生成
const timeSlots = [
{ id: 1, time: '17:00', value: 17.0 },
{ id: 2, time: '17:30', value: 17.5 },
{ id: 3, time: '18:00', value: 18.0 },
{ id: 4, time: '18:30', value: 18.5 },
{ id: 5, time: '19:00', value: 19.0 },
{ id: 6, time: '19:30', value: 19.5 },
{ id: 7, time: '20:00', value: 20.0 },
];
const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
const [startTime, setStartTime] = useState(null);
const [endTime, setEndTime] = useState(null);
const [isSelecting, setIsSelecting] = useState(false);
// 選択範囲を計算
useEffect(() => {
if (selectedTimeSlots.length > 0) {
const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.value - b.value);
setStartTime(sortedSlots[0]);
setEndTime(sortedSlots[selectedTimeSlots.length - 1]);
} else {
setStartTime(null);
setEndTime(null);
}
}, [selectedTimeSlots]);
// 時間スロットをクリックした時の処理
const handleTimeSlotClick = (slot) => {
if (!isSelecting) {
// 新しい選択を開始
setSelectedTimeSlots([slot]);
setIsSelecting(true);
} else {
// 範囲選択中
if (selectedTimeSlots.length === 1) {
// 最初のクリックの後、範囲を選択
const firstSlot = selectedTimeSlots[0];
const newSelection = [];
    // 開始と終了の間にある全てのスロットを選択
    const start = Math.min(firstSlot.id, slot.id);
    const end = Math.max(firstSlot.id, slot.id);

    for (let i = start; i <= end; i++) {
      newSelection.push(timeSlots.find(s => s.id === i));
    }

    setSelectedTimeSlots(newSelection);
    setIsSelecting(false);
  }
}
};
// リセット処理
const resetSelection = () => {
setSelectedTimeSlots([]);
setIsSelecting(false);
};
// 時間の長さを計算
const getDurationText = () => {
if (!startTime || !endTime) return '';
// 20:00は終了時間として扱われるため、実際の範囲は19:30までとして計算
const duration = endTime.time === '20:00'
? endTime.value - 0.5 - startTime.value
: endTime.value - startTime.value;
const hours = Math.floor(duration);
const minutes = (duration % 1) * 60;
let result = '';
if (hours > 0) {
  result += `${hours}時間`;
}
if (minutes > 0) {
  result += `${minutes}分`;
}
return result;
};

return (
<Card className="w-96">
<CardHeader>
<CardTitle className="flex items-center justify-center gap-2">
<Clock className="h-5 w-5" />
<span>時間範囲を選択</span>
</CardTitle>
</CardHeader>
<CardContent>
<div className="space-y-6">
{/* 時間スロットの表示 */}
<div className="grid grid-cols-7 gap-2">
{timeSlots.map((slot) => {
const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
const isFirst = startTime && slot.id === startTime.id;
const isLast = endTime && slot.id === endTime.id;

          return (
            <Button
              key={slot.id}
              variant={isSelected ? "default" : "outline"}
              className={`p-2 h-auto text-xs transition-all ${
                isFirst ? 'rounded-l-md rounded-r-none' :
                isLast ? 'rounded-r-md rounded-l-none' :
                isSelected ? 'rounded-none' : 'rounded-md'
              }`}
              onClick={() => handleTimeSlotClick(slot)}
            >
              {slot.time}
            </Button>
          );
        })}
      </div>

      {/* 選択された範囲の表示 */}
      {startTime && endTime && (
        <div className="bg-gray-100 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium">
                {startTime.time} 〜 {endTime.time === '20:00' ? '19:30' : endTime.time}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                合計: {getDurationText()}
              </p>
            </div>
            <Badge variant="outline" className="ml-2">
              {selectedTimeSlots.length - (endTime.time === '20:00' ? 1 : 0)}コマ
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={resetSelection}
          >
            リセット
          </Button>
        </div>
      )}

      {isSelecting && (
        <p className="text-sm text-primary">範囲の終了位置を選択してください</p>
      )}
    </div>
  </CardContent>
</Card>
);
};
export default TimeSegmentSelector;