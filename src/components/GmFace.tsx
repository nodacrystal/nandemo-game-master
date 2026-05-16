interface Props {
  speaking: boolean;
}

export function GmFace({ speaking }: Props) {
  return (
    <div className="gm-face">
      <div className="face">
        <div className="hair" />
        <div className="eyes">
          <span className="eye" />
          <span className="eye" />
        </div>
        <div className={`mouth ${speaking ? 'speaking' : ''}`} />
      </div>
      <div className="name">GM(野田クリスタル仮)</div>
    </div>
  );
}
