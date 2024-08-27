import { ReactNode } from 'react';

import { FieldType, TimeRange } from '@grafana/data';
import { SortOrder } from '@grafana/schema/dist/esm/common/common.gen';
import { TooltipDisplayMode, useStyles2 } from '@grafana/ui';
import { VizTooltipContent } from 'imports/packages/grafana-ui/src/components/VizTooltip/VizTooltipContent';
import { VizTooltipFooter } from 'imports/packages/grafana-ui/src/components/VizTooltip/VizTooltipFooter';
import { VizTooltipHeader } from 'imports/packages/grafana-ui/src/components/VizTooltip/VizTooltipHeader';
import { VizTooltipItem } from 'imports/packages/grafana-ui/src/components/VizTooltip/types';
import { getContentItems } from 'imports/packages/grafana-ui/src/components/VizTooltip/utils';
import { findNextStateIndex, fmtDuration } from 'imports/public/app/core/components/TimelineChart/utils';

import { getDataLinks } from '../../../../../../utils';
import { TimeSeriesTooltipProps, getStyles } from '../timeseries/TimeSeriesTooltip';
import { isTooltipScrollable } from '../timeseries/utils';

interface StateTimelineTooltip2Props extends TimeSeriesTooltipProps {
  timeRange: TimeRange;
  withDuration: boolean;
}

export const StateTimelineTooltip2 = ({
  series,
  dataIdxs,
  seriesIdx,
  mode = TooltipDisplayMode.Single,
  sortOrder = SortOrder.None,
  isPinned,
  annotate,
  timeRange,
  withDuration,
  maxHeight,
}: StateTimelineTooltip2Props) => {
  const styles = useStyles2(getStyles);

  const xField = series.fields[0];

  const dataIdx = seriesIdx != null ? dataIdxs[seriesIdx] : dataIdxs.find((idx) => idx != null);

  const xVal = xField.display!(xField.values[dataIdx!]).text;

  mode = isPinned ? TooltipDisplayMode.Single : mode;

  const contentItems = getContentItems(series.fields, xField, dataIdxs, seriesIdx, mode, sortOrder);

  // append duration in single mode
  if (withDuration && mode === TooltipDisplayMode.Single) {
    const field = series.fields[seriesIdx!];
    const nextStateIdx = findNextStateIndex(field, dataIdx!);
    let nextStateTs;
    if (nextStateIdx) {
      nextStateTs = xField.values[nextStateIdx!];
    }

    const stateTs = xField.values[dataIdx!];
    let duration: string;

    if (nextStateTs) {
      duration = nextStateTs && fmtDuration(nextStateTs - stateTs);
    } else {
      const to = timeRange.to.valueOf();
      duration = fmtDuration(to - stateTs);
    }

    contentItems.push({ label: 'Duration', value: duration });
  }

  let footer: ReactNode;

  if (isPinned && seriesIdx != null) {
    const field = series.fields[seriesIdx];
    const dataIdx = dataIdxs[seriesIdx]!;
    const links = getDataLinks(field, dataIdx);

    footer = <VizTooltipFooter dataLinks={links} annotate={annotate} />;
  }

  const headerItem: VizTooltipItem = {
    label: xField.type === FieldType.time ? '' : (xField.state?.displayName ?? xField.name),
    value: xVal,
  };

  return (
    <div className={styles.wrapper}>
      <VizTooltipHeader item={headerItem} isPinned={isPinned} />
      <VizTooltipContent
        items={contentItems}
        isPinned={isPinned}
        scrollable={isTooltipScrollable({ mode, maxHeight })}
        maxHeight={maxHeight}
      />
      {footer}
    </div>
  );
};
