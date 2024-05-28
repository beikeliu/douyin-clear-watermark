import { useRef, useState } from 'react';
import axios from 'axios';

const App = () => {
  const textareaRef = useRef(null);
  const [outputValue, setOutputValue] = useState('');
  const [loading, setLoading] = useState();

  const handleButtonClick = async () => {
    if (textareaRef.current.value && !loading) {
      setOutputValue('');
      setLoading(true);
      const res = await axios.get(`/api/v1/douyinVideoRemoveWatermark`, {
        params: {
          shareText: textareaRef.current.value
        },
      }).catch(() => { }).finally(() => {
        setLoading(false);
      });
      setOutputValue(res.data.data.url);
    }
  };


  return (
    <>
      <textarea ref={textareaRef} placeholder='请输入抖音视频分享内容' className='input'></textarea>
      <button onClick={handleButtonClick} className='button'>点击一键去水印</button>
      <textarea value={outputValue} placeholder='解析地址预览' className='output'></textarea>
      {loading ? <p>当前正在解析...</p> : null}
    </>
  );
}

export default App;