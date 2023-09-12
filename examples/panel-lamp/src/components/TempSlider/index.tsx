/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Button, Image, Text, View } from '@ray-js/ray';
import { getLaunchOptionsSync } from '@ray-js/api';
import React, { useEffect, useState } from 'react';
import useThrottleFn from '@/hooks/useThrottleFn';
import { OpacitySlider } from '@/components';
// import { getDpIdByCode } from '@/utils/dp/putDpData';
import dpCodes from '@/config/dpCodes';
import SupportUtils from '@/utils/SupportUtils';
import colorUtils from '@/utils/color.js';
import Strings from '@/i18n';
import { formatPercent } from '@/utils';
import styles from './index.module.less';

const { brightKelvin2rgb } = colorUtils;

interface IProps {
  style?: React.CSSProperties;
  disable?: boolean;
  isSupportKelvin?: boolean;
  value?: number;
  trackStyle?: React.CSSProperties;
  onTouchMove?: (v) => void;
  onTouchEnd?: (v) => void;
}
const { deviceId: devId, groupId } = getLaunchOptionsSync().query;
const { temperatureCode } = dpCodes;

export function TempSlider(props: IProps) {
  const {
    isSupportKelvin,
    value,
    disable = false,
    trackStyle,
    style,
    onTouchMove,
    onTouchEnd,
  } = props;

  const [textVal, setTextVal] = useState('');
  const [currentVal, setCurrentVal] = useState(value);

  useEffect(() => {
    formatText(value);
    if (value !== currentVal) setCurrentVal(value);
  }, [value, isSupportKelvin]);

  const formatText = useThrottleFn(
    v => {
      if (isSupportKelvin) {
        const params = {
          resId: groupId || devId,
          dps: [
            {
              dpCode: temperatureCode,
              dpValue: v,
              // dpId: getDpIdByCode(temperatureCode),
            },
          ],
          type: SupportUtils.isGroupDevice() ? '5' : '6',
          success: r => {
            setTextVal(
              r?.advancedCapability?.[0]?.translatedValue
                ? `${r?.advancedCapability?.[0]?.translatedValue}${r?.advancedCapability[0]?.unit}`
                : `${formatPercent(v)}%`
            );
          },
          fail: res => {
            console.log('dpTranslateAdvancedCapability fail====', res);
            setTextVal(`${formatPercent(v)}%`);
          },
        };
        ty.device.dpTranslateAdvancedCapability({ ...params });
      } else {
        setTextVal(`${formatPercent(v)}%`);
      }
    },
    { wait: 80 }
  ).run;

  const handleMove = v => {
    setCurrentVal(v);
    formatText(v);
    onTouchMove?.(v);
  };

  const handleEnd = v => {
    setCurrentVal(v);
    formatText(v);
    onTouchEnd?.(v);
  };

  // const currentTemp = textVal.includes('%')
  //   ? +textVal.substring(0, textVal.length - 1) * 10
  //   : +textVal.substring(0, textVal.length - 1);

  return (
    <OpacitySlider
      style={style}
      label={Strings.getLang('temp')}
      textValue={textVal}
      disable={disable}
      value={value}
      trackStyle={trackStyle}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      background="linear-gradient(270deg, #CDECFE 1.22%, #FFFFFF 45.36%, #FFFFFF 53.27%, #FFCA5C 98.32%)"
      // thumbStyle={{ backgroundColor: disable ? '#000' : brightKelvin2rgb(1000, value) }}
      thumbStyle={{
        backgroundColor: disable ? '#000' : 'transparent',
        // backgroundColor: disable ? '#000' : brightKelvin2rgb(1000, currentVal),
      }}
    />
  );
}

export default TempSlider;
