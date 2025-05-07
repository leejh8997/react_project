import { useRecoilState } from 'recoil'; // 리코일 전용 useState, 콘텍스트 처럼 자식 컴포넌트에서 값을 바로 꺼내서 사용가능
import { countState } from '../states/countAtom';

function RecoilEx(){
    let [countMap, setCount] = useRecoilState(countState);
    return(
        <>
            <h3>{"countA : " + countMap.countA}</h3>
            <button onClick={()=>{setCount({...countMap, countA: countMap.countA+1})}}>A++</button>
            <h3>{"countB : " + countMap.countB}</h3>
            <button onClick={()=>{setCount(prev =>({...prev, countB: countMap.countB+1}))}}>B++</button>
        </>
    )
}

export default RecoilEx