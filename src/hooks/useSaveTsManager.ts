import { useState, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { processTimestamps } from '@/utils/timestampUtils';
import { useToast } from '@/hooks/use-toast';

export const useSaveTsManager = () => {
  const [showSaveTsDialog, setShowSaveTsDialog] = useState(false);
  const [antidelayInput, setAntidelayInput] = useState('15');
  const [saveTsButtonPressed, setSaveTsButtonPressed] = useState(false);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const { toast } = useToast();

  // Save Ts button handlers
  const handleSaveTsMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('💾 SaveTsManager: Save Ts button mouse down');
    e.preventDefault();
    e.stopPropagation();
    setSaveTsButtonPressed(true);
    isLongPressRef.current = false;
    
    longPressTimerRef.current = setTimeout(() => {
      console.log('💾 SaveTsManager: Long press detected - showing save dialog');
      isLongPressRef.current = true;
      setShowSaveTsDialog(true);
    }, 3000);
  };

  const handleSaveTsMouseUp = async (e: React.MouseEvent | React.TouchEvent, signalsText: string) => {
    console.log('💾 SaveTsManager: Save Ts button mouse up', {
      isLongPress: isLongPressRef.current
    });
    
    e.preventDefault();
    e.stopPropagation();
    setSaveTsButtonPressed(false);
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // If it wasn't a long press, save directly to Documents directory
    if (!isLongPressRef.current) {
      console.log('💾 SaveTsManager: Short press detected - saving directly to Documents directory');
      console.log('💾 SaveTsManager: Input signalsText:', signalsText);
      console.log('💾 SaveTsManager: Current antidelayInput:', antidelayInput);
      
      // Extract timestamps and process them
      const antidelaySecondsValue = parseInt(antidelayInput) || 0;
      console.log('💾 SaveTsManager: Parsed antidelay seconds:', antidelaySecondsValue);
      
      const processedTimestamps = processTimestamps(signalsText, antidelaySecondsValue);
      console.log('💾 SaveTsManager: Processed timestamps result:', processedTimestamps);
      console.log('💾 SaveTsManager: Number of processed timestamps:', processedTimestamps.length);
      
      // Create file content
      const fileContent = processedTimestamps.join('\n');
      console.log('💾 SaveTsManager: File content to write:', fileContent);
      console.log('💾 SaveTsManager: File content length:', fileContent.length);
      
      // Always save to Documents directory (accessible without SAF)
      const fileName = 'timestamps.txt';
      console.log('💾 SaveTsManager: Saving to Documents directory with filename:', fileName);
      
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: fileContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        
        toast({
          title: "File saved successfully",
          description: `Saved to Documents/${fileName}`,
        });
        
        console.log('💾 SaveTsManager: File written successfully to Documents directory:', fileName);
        
      } catch (error) {
        console.error('💾 SaveTsManager: Error writing file to Documents:', error);
        console.error('💾 SaveTsManager: Error details:', {
          message: error.message,
          stack: error.stack,
          fileName: fileName,
          antidelay: antidelayInput
        });
        
        // Show error toast to user
        toast({
          title: "Error saving file",
          description: `Failed to save file: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveTsMouseLeave = () => {
    console.log('💾 SaveTsManager: Save Ts button mouse leave');
    setSaveTsButtonPressed(false);
    // Don't clear timeout on mouse leave to prevent inspection interference
    // Only clear on mouse up or touch end
  };


  // Save Ts dialog handlers
  const handleSaveTsSubmit = () => {
    console.log('💾 SaveTsManager: Save Ts dialog submit - closing dialog');
    setShowSaveTsDialog(false);
  };

  const handleSaveTsCancel = () => {
    console.log('💾 SaveTsManager: Save Ts dialog cancelled');
    setShowSaveTsDialog(false);
  };

  return {
    showSaveTsDialog,
    antidelayInput,
    setAntidelayInput,
    saveTsButtonPressed,
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleSaveTsSubmit,
    handleSaveTsCancel
  };
};