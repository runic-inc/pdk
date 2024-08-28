// iconprops

import { memo, useEffect, useState } from 'react';

export interface IconProps {
    icon: `fa-${string}`;
    className?: string;
}

const Icon = ({ icon, className }: IconProps) => {
    return <i className={`fa-regular ${icon} ${className}`} />;
};

export default Icon;
