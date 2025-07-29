'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, parse } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card } from "@/components/aily/Card";
import { Button } from "@/components/aily/Button";
import { Input } from "@/components/aily/Input";

const OffWorkPage = () => {
  const [targetTime, setTargetTime] = useState<string>('18:00');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [records, setRecords] = useState<{ date: string; time: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化目标时间
  useEffect(() => {
    const savedTime = localStorage.getItem('offWorkTarget');
    if (savedTime) setTargetTime(savedTime);
    else setTargetTime('18:00');
    
    const savedRecords = localStorage.getItem('offWorkRecords');
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
    }
  }, []);

  // 倒计时计算
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [targetHour, targetMinute] = targetTime.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(targetHour, targetMinute, 0, 0);
      
      let diff = targetDate.getTime() - now.getTime();
      
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000; // 如果已经过了今天的目标时间，计算到明天
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // 检查是否到达下班时间
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        if (!showCelebration) {
          setShowCelebration(true);
          if (audioRef.current) {
            audioRef.current.play();
          }
          
          // 添加记录（每天只记录一次）
          const today = new Date();
          const todayStr = format(today, 'yyyy-MM-dd');
          if (!records.some(record => record.date === todayStr)) {
            const newRecord = {
              date: todayStr,
              time: format(today, 'HH:mm')
            };
            const updatedRecords = [...records, newRecord];
            setRecords(updatedRecords);
            localStorage.setItem('offWorkRecords', JSON.stringify(updatedRecords));
          }
          
          // 10秒后关闭庆祝弹窗
          setTimeout(() => setShowCelebration(false), 10000);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetTime, records, showCelebration]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTargetTime(newTime);
    localStorage.setItem('offWorkTarget', newTime);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-yellow-50 border-2 border-orange-200 shadow-lg">
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-orange-600 mb-2">下班倒计时</h1>
            <p className="text-orange-500 mb-8">目标时间: {targetTime}</p>
            
            <div className="flex justify-center space-x-6 mb-8">
              <TimeBlock value={timeLeft.hours} label="小时" />
              <TimeBlock value={timeLeft.minutes} label="分钟" />
              <TimeBlock value={timeLeft.seconds} label="秒钟" />
            </div>
            
            {(timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) ? (
              <div className="py-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl font-bold text-orange-600"
                >
                  下班啦！🎉
                </motion.div>
              </div>
            ) : null}
            
            <div className="mt-8 flex flex-col items-center">
              <label className="text-orange-700 font-medium mb-2">修改下班时间</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={targetTime}
                  onChange={handleTimeChange}
                  className="w-32 text-center py-2 border-orange-300 rounded-lg"
                />
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  设置
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {records.length > 0 && (
          <Card className="mt-6 bg-yellow-50 border-2 border-orange-200 shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-orange-600 mb-4">下班记录</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {records.map((record, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between p-3 bg-orange-100 rounded-lg"
                  >
                    <span className="font-medium text-orange-700">{record.date}</span>
                    <span className="text-orange-600">{record.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
      
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-7xl font-bold text-orange-600"
              >
                下班啦！
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-24 h-24 flex items-center justify-center bg-orange-500 rounded-xl shadow-lg">
      <span className="text-4xl font-bold text-white">{String(value).padStart(2, '0')}</span>
    </div>
    <span className="mt-2 text-orange-700 font-medium">{label}</span>
  </div>
);

export default OffWorkPage;
