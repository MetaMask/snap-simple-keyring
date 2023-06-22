import Grid from '@mui/material/Grid';
import React, { useState } from 'react';
import { GiAndroidMask, GiDeathStar } from 'react-icons/gi';
import styled from 'styled-components';

import { StyledBox } from '../pages/styledComponents';

const AccordionContainer = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const AccordionItem = styled.div`
  border: 1px solid #eaeaea;
  border-radius: 4px;
  margin-bottom: 2rem;
  width: 100%;
`;

const AccordionHeader = styled.div`
  padding: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
`;

const AccordionContent = styled.div`
  padding: 16px;
  display: ${({ isOpen }: { isOpen: boolean }) => (isOpen ? 'block' : 'none')};
`;

export const Accordion = ({ items }: any) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const toggleAccordion = (index: number) => {
    let newIndexes;
    if (activeIndexes.includes(index)) {
      newIndexes = activeIndexes.filter((element: any) => element !== index);
    } else {
      newIndexes = [...activeIndexes, index];
    }
    setActiveIndexes(newIndexes);
  };

  return (
    <AccordionContainer>
      {items.map((item: any, index: number) => (
        <AccordionItem key={index}>
          <AccordionHeader onClick={() => toggleAccordion(index)}>
            {item.name}
            {activeIndexes.includes(index) ? (
              <GiAndroidMask />
            ) : (
              <GiDeathStar />
            )}
          </AccordionHeader>
          <AccordionContent isOpen={activeIndexes.includes(index)}>
            <StyledBox sx={{ flexGrow: 1 }}>
              <Grid
                container
                direction="column"
                spacing={4}
                style={{
                  overflowX: 'hidden',
                }}
              >
                <Grid item xs={1}>
                  {item.description}
                </Grid>
                {item.inputUI && (
                  <Grid item xs={1}>
                    {item.inputUI}
                  </Grid>
                )}
                <Grid item xs={1}>
                  {item.actionUI}
                </Grid>
              </Grid>
            </StyledBox>
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionContainer>
  );
};

export default Accordion;
