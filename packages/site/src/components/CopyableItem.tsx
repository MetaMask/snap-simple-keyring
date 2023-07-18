import { useState } from 'react';

import { CopyIcon } from './icons/CopyIcon';
import {
  AccountRow,
  CopyableContainer,
  CopyableItemValue,
} from './styledComponents';

export const CopyableItem = ({ value }: { value: string }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  return (
    <AccountRow>
      <CopyableContainer
        clicked={showAnimation}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          setShowAnimation(true);
          await navigator.clipboard.writeText(value);
          setShowAnimation(false);
        }}
      >
        <CopyableItemValue>{value}</CopyableItemValue>
        <CopyIcon />
      </CopyableContainer>
    </AccountRow>
  );
};
