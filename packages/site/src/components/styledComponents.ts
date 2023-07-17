import Box from '@mui/material/Box';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 5%;
  padding-right: 5%;
  flex: 1;
  margin-bottom: 7.6rem;
`;

export const StyledBox = styled(Box)`
  width: 100%;
`;

export const InformationBox = styled.div<{ error: boolean }>`
  display: flex;
  background-color: ${({ error }) => (error ? '#B22222' : '#50c878')};
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
`;

export const Divider = styled.div`
  color: #24272a;

  /* Heading-MD */
  font-family: Euclid Circular B;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px; /* 133.333% */
`;

export const DividerTitle = styled.p`
  margin: 0;
  font-size: 25px;
  margin-bottom: 3rem;
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  padding-left: 14rem;
  padding-right: 14rem;
  flex: 1;
`;

export const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

export const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;
