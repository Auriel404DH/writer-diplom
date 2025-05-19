import { useState, useEffect, useRef } from 'react';
import { writingThemes, soundOptions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayIcon, PauseIcon, Save, Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AmbientControlProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  wordCount: number;
  readingTime: number;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function AmbientControl({ 
  currentTheme, 
  onThemeChange, 
  wordCount, 
  readingTime,
  onSave,
  onPublish,
  isSaving,
  isPublishing
}: AmbientControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState('silence');
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const soundFiles: Record<string, string> = {
    rain: 'https://soundbible.com/mp3/rainforest_ambience-GlorySunz-1938133500.mp3',
    fireplace: 'https://soundbible.com/mp3/fireplace-Daniel_Simion-1409961729.mp3',
    space: 'https://soundbible.com/mp3/rocket_-engine-Sergey-214991831.mp3',
    forest: 'https://soundbible.com/mp3/summer-ambience-outdoors-02-moderate-winds-few-birds-Stephan_Schutze-1434204646.mp3'
  };

  useEffect(() => {
    if (sound === 'silence') {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const soundFile = soundFiles[sound];
    if (soundFile) {
      audioRef.current.src = soundFile;
      audioRef.current.loop = true;
      audioRef.current.volume = volume / 100;
      
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Handle browser autoplay restrictions
          setIsPlaying(false);
        });
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [sound, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const toggleAudio = () => {
    if (sound === 'silence') return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {
        // Handle browser autoplay restrictions
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white border-t border-neutral-200 p-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-xs font-medium text-neutral-500 mr-2">Тема:</span>
          <div className="flex space-x-1">
            {writingThemes.map(theme => (
              <Button
                key={theme.id}
                variant="outline"
                size="sm"
                className={`w-6 h-6 rounded-full p-0 ${theme.className} ${currentTheme === theme.className ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                onClick={() => onThemeChange(theme.className)}
              />
            ))}
          </div>
        </div>
        
        <div className="h-5 border-r border-neutral-200"></div>
        
        <div className="flex items-center">
          <span className="text-xs font-medium text-neutral-500 mr-2">Звук:</span>
          <div className="flex items-center space-x-1">
            <Button 
              size="sm"
              variant="ghost" 
              onClick={toggleAudio}
              disabled={sound === 'silence'}
              className="p-1.5 rounded hover:bg-neutral-100 h-8 w-8"
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Select
              value={sound}
              onValueChange={setSound}
            >
              <SelectTrigger className="text-xs border-0 pr-6 py-1 focus:ring-0 focus:shadow-none h-8 w-[100px]">
                <SelectValue placeholder="Тишина" />
              </SelectTrigger>
              <SelectContent>
                {soundOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center w-20">
              <i className="fas fa-volume-down text-neutral-500 text-xs mr-1"></i>
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => setVolume(values[0])}
                className="w-full h-1"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex items-center">
        {onSave && onPublish && (
          <div className="flex items-center space-x-2 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="text-primary hover:text-primary/80 border-primary/20"
            >
              {isSaving ? 'Сохранение...' : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  <span>Сохранить</span>
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              onClick={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Публикация...' : (
                <>
                  <Upload className="mr-1.5 h-4 w-4" />
                  <span>Опубликовать</span>
                </>
              )}
            </Button>
          </div>
        )}
      
        <div className="flex items-center text-xs text-neutral-500">
          <span>Слов: {wordCount}</span>
          <span className="mx-2">•</span>
          <span>{readingTime} мин. чтения</span>
        </div>
      </div>
    </div>
  );
}
