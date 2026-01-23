import React from 'react';
import { Text } from 'react-native-paper';
import { typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const mergeStyles = (base, custom, color) => {
    if (color) {
        return [base, { color }, custom];
    }
    return [base, custom];
};

export const Heading = ({ children, level = 3, style, color }) => {
    const { colors } = useTheme();
    const map = { 1: typography.h1, 2: typography.h2, 3: typography.h3, 4: typography.h4 };
    const base = map[level] || typography.h3;
    return <Text style={mergeStyles(base, style, color ?? colors.text)}>{children}</Text>;
};

export const Title = ({ children, style, color }) => {
    const { colors } = useTheme();
    return <Text style={mergeStyles(typography.h2, style, color ?? colors.text)}>{children}</Text>;
};

export const Body = ({ children, style, color, weight }) => {
    const { colors } = useTheme();
    const base = weight === 'medium' ? typography.bodyMedium : typography.body;
    return <Text style={mergeStyles(base, style, color ?? colors.text)}>{children}</Text>;
};

export const BodySmall = ({ children, style, color }) => {
    const { colors } = useTheme();
    return <Text style={mergeStyles(typography.bodySmall, style, color ?? colors.text)}>{children}</Text>;
};

export const Label = ({ children, style, color }) => {
    const { colors } = useTheme();
    return <Text style={mergeStyles(typography.label, style, color ?? colors.textSecondary)}>{children}</Text>;
};

export default { Heading, Title, Body, BodySmall, Label };
