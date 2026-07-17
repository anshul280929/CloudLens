import * as React from "react";
import { cn } from "@/lib/utils";

export interface TerminalCodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  code?: string;
  language?: "bash" | "typescript" | "json" | string;
}

export const TerminalCodeBlock = React.forwardRef<HTMLDivElement, TerminalCodeBlockProps>(
  ({ className, title = "Terminal", code, language = "bash", children, ...props }, ref) => {
    
    const highlightBashLine = (line: string, index: number) => {
      // Prompt/Command: $ npx cloudlens scan ...
      if (line.startsWith("$ ")) {
        const cmdPart = "npx cloudlens scan";
        const rest = line.substring(2 + cmdPart.length);
        return (
          <div key={index}>
            <span className="text-accent-blue select-none">$</span>{" "}
            <span className="text-ink">{cmdPart}</span>
            <span className="text-product-vault">{rest}</span>
          </div>
        );
      }
      
      // Divider line
      if (line.startsWith("──")) {
        return (
          <div key={index} className="text-ink-subtle">
            {line}
          </div>
        );
      }
      
      // Log line with checkmarks
      if (line.includes("✓")) {
        const checkIdx = line.indexOf("✓");
        const beforeCheck = line.substring(0, checkIdx);
        const afterCheck = line.substring(checkIdx + 1);
        
        if (afterCheck.includes("done")) {
          const doneIdx = afterCheck.indexOf("done");
          const text = afterCheck.substring(0, doneIdx);
          const rest = afterCheck.substring(doneIdx + 4);
          return (
            <div key={index}>
              {beforeCheck}
              <span className="text-semantic-success">✓</span>
              {text}
              <span className="text-accent-blue">done</span>
              <span className="text-ink-subtle">{rest}</span>
            </div>
          );
        }
        
        if (afterCheck.includes("files scanned")) {
          const idx = afterCheck.indexOf("247 files scanned");
          if (idx !== -1) {
            return (
              <div key={index}>
                {beforeCheck}
                <span className="text-semantic-success">✓</span>
                {afterCheck.substring(0, idx)}
                <span className="text-accent-blue">247 files scanned</span>
              </div>
            );
          }
        }
        
        if (afterCheck.includes("Scan complete")) {
          return (
            <div key={index}>
              {beforeCheck}
              <span className="text-semantic-success">✓</span> Scan complete.{" "}
              <span className="text-accent-blue">5 services</span> across{" "}
              <span className="text-accent-blue">2 providers</span>.{" "}
              <span className="text-ink-subtle">{afterCheck.substring(afterCheck.indexOf("("))}</span>
            </div>
          );
        }
        
        return (
          <div key={index}>
            {beforeCheck}
            <span className="text-semantic-success">✓</span>
            {afterCheck}
          </div>
        );
      }
      
      // Service rows
      if (line.startsWith("  AWS") || line.startsWith("  Stripe")) {
        const isAws = line.includes("AWS");
        const name = isAws ? "AWS" : "Stripe";
        const nameIdx = line.indexOf(name);
        const afterName = line.substring(nameIdx + name.length);
        
        const cmtText = isAws ? "4 services" : "1 service";
        const cmtIdx = afterName.indexOf(cmtText);
        
        if (cmtIdx !== -1) {
          const valText = afterName.substring(0, cmtIdx);
          return (
            <div key={index}>
              {"  "}
              <span className="text-semantic-success">{name}</span>
              <span className="text-accent-blue">{valText}</span>
              <span className="text-ink-subtle">{cmtText}</span>
            </div>
          );
        }
      }
      
      return <div key={index}>{line}</div>;
    };

    const highlightTypeScript = (codeText: string) => {
      const lines = codeText.split("\n");
      return lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("/*")) {
          return (
            <div key={i} className="text-ink-subtle">
              {line}
            </div>
          );
        }

        return (
          <div key={i}>
            {renderTypeScriptLine(line)}
          </div>
        );
      });
    };

    // Safely render TypeScript line with spans
    const renderTypeScriptLine = (line: string) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      let html = escaped;
      
      // Strings
      html = html.replace(/(["'])(.*?)\1/g, '<span class="text-product-vault">$1$2$1</span>');
      
      // Keywords
      html = html.replace(/\b(export|default|true|false|const|import|from)\b/g, '<span class="text-accent-blue">$1</span>');
      
      // Properties/Keys
      html = html.replace(/\b(\w+)\s*:/g, '<span class="text-ink">$1</span>:');
      
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const renderCode = () => {
      if (!code) return children;
      
      if (language === "bash") {
        return code.split("\n").map((line, idx) => highlightBashLine(line, idx));
      }
      
      if (language === "typescript" || language === "javascript") {
        return highlightTypeScript(code);
      }
      
      // Fallback: render raw code lines
      return code.split("\n").map((line, idx) => <div key={idx}>{line}</div>);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-1 border border-[rgba(178,182,189,0.1)] rounded-lg overflow-hidden mb-3",
          className
        )}
        {...props}
      >
        <div className="flex items-center px-4 py-[9px] border-b border-[rgba(178,182,189,0.1)] gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-semantic-error" />
          <div className="w-2.5 h-2.5 rounded-full bg-semantic-warning" />
          <div className="w-2.5 h-2.5 rounded-full bg-semantic-success" />
          {title && (
            <span className="text-caption text-ink-subtle ml-auto select-none">
              {title}
            </span>
          )}
        </div>
        <pre className="p-5 font-mono text-[13px] leading-[1.75] text-ink-muted overflow-x-auto whitespace-pre">
          <code>{renderCode()}</code>
        </pre>
      </div>
    );
  }
);

TerminalCodeBlock.displayName = "TerminalCodeBlock";
