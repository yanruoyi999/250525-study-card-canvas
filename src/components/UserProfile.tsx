import React, { useState, useRef } from "react";
import { User, Upload, Edit3 } from "lucide-react";

type UserInfo = {
  nickname: string;
  avatar?: string;
};

type Props = {
  userInfo: UserInfo;
  onUserInfoChange: (userInfo: UserInfo) => void;
};

export default function UserProfile({ userInfo, onUserInfoChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNickname, setTempNickname] = useState(userInfo.nickname);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNicknameEdit = () => {
    setIsEditing(true);
    setTempNickname(userInfo.nickname);
  };

  const handleNicknameSave = () => {
    onUserInfoChange({ ...userInfo, nickname: tempNickname });
    setIsEditing(false);
  };

  const handleNicknameCancel = () => {
    setTempNickname(userInfo.nickname);
    setIsEditing(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatar = e.target?.result as string;
        onUserInfoChange({ ...userInfo, avatar });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNicknameSave();
    } else if (e.key === 'Escape') {
      handleNicknameCancel();
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <div className="flex items-center gap-3">
        {/* 头像区域 */}
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            {userInfo.avatar ? (
              <img 
                src={userInfo.avatar} 
                alt="用户头像" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={24} className="text-white" />
            )}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
              <Upload size={12} className="text-gray-600" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* 昵称区域 */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleNicknameSave}
              className="font-medium text-gray-800 bg-white rounded px-2 py-1 border-2 border-blue-300 focus:outline-none"
              maxLength={20}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">
                {userInfo.nickname || "点击设置昵称"}
              </span>
              <button
                onClick={handleNicknameEdit}
                className="p-1 hover:bg-white/50 rounded transition-colors"
                title="编辑昵称"
              >
                <Edit3 size={14} className="text-gray-600" />
              </button>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            点击头像上传照片，点击昵称进行编辑
          </div>
        </div>
      </div>
    </div>
  );
} 