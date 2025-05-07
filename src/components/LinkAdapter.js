import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI에서 ref 문제 없이 쓸 수 있게 forwardRef로 감쌈
const LinkAdapter = React.forwardRef(function LinkAdapter(props, ref) {
    const { button, ...rest } = props; // 👈 button prop 제거
    return <RouterLink ref={ref} {...rest} />;
  });

export default LinkAdapter;