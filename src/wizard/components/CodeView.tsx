const CodeView = ({ content }: { content: string }) => {
    return (
      <pre className="bg-gray-900 text-white p-4 rounded">
        <code>{content}</code>
      </pre>
    );
  };
  
  export default CodeView;