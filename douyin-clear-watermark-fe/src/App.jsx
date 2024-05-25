import { useRef, useState } from 'react';
import axios from 'axios';

const App = () => {
  const textareaRef = useRef(null);
  const [outputValue, setOutputValue] = useState('');
  const disableClick = useRef(false);

  const handleButtonClick = async () => {
    if (textareaRef.current.value && !disableClick.current) {
      setOutputValue('');
      disableClick.current = true;
      const res = await axios.get(`/api/v1/douyinVideoRemoveWatermark`, {
        params: {
          shareText: textareaRef.current.value
        },
      }).catch(() => { }).finally(() => {
        disableClick.current = false;
      });
      setOutputValue(res.data.data.url);
    }
  };


  return (
    <>
      <textarea ref={textareaRef} placeholder='请输入抖音视频分享内容' className='input'></textarea>
      <button onClick={handleButtonClick} className='button'>点击一键去水印</button>
      <textarea value={outputValue} placeholder='解析地址预览' className='output'></textarea>
    </>
  );
}

export default App;