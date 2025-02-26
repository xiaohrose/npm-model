import React, { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

interface MarkdownContentProps {
    markdown: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ markdown }) => {
    const [htmlContent, setHtmlContent] = useState<string>('');

    useEffect(() => {
        if (markdown) {
            setHtmlContent(md.render(markdown));
        }
    }, [markdown]);

    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
};

export default MarkdownContent;
