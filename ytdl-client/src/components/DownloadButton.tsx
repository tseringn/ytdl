// src/components/Button.js
import styled from "styled-components";

export const DownloadButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;
