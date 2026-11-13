from PIL import Image, ImageDraw, ImageFont
import os
OUT="/workspace/blog3/repo/public/images/posts/hydrangea-winter-care"
B="/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"; R="/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
def F(s,b=False): return ImageFont.truetype(B if b else R, s, index=1)
BG="#FCFBF8"; BR="#416743"; DK="#355C45"; TX="#273322"; MU="#5C6A60"; SG="#EAF1E7"; SD="#F4EBDC"; RS="#F8E8E4"; AC="#D78981"; BD="#E6E4DC"; WARN="#8C4E4A"
def wrap(d,text,font,w):
    lines=[];
    for para in text.split("\n"):
        cur=""
        for ch in para:
            if d.textlength(cur+ch,font=font)>w and cur:
                # break at last space if possible
                sp=cur.rfind(" ")
                if sp>0: lines.append(cur[:sp]); cur=cur[sp+1:]+ch
                else: lines.append(cur); cur=ch
            else: cur+=ch
        lines.append(cur)
    return lines
def para(d,xy,text,font,fill,w,lh=1.45):
    x,y=xy
    for l in wrap(d,text,font,w):
        d.text((x,y),l,font=font,fill=fill); y+=int(font.size*lh)
    return y
def header(d,W,title,sub=None,kicker="꽃과살림노트 · 수국 월동"):
    d.rectangle([0,0,W,14],fill=BR)
    d.text((64,52),kicker,font=F(28,True),fill=BR)
    y=para(d,(64,96),title,F(54,True),TX,W-128,1.3)
    if sub: y=para(d,(64,y+8),sub,F(30),MU,W-128)
    return y+24
def footer(d,W,H,text="출처: 농촌진흥청 농사로, 영국왕립원예협회(RHS), 미국 Ask Extension 등 · flowerhomenote.com"):
    d.line([64,H-78,W-64,H-78],fill=BD,width=2)
    d.text((64,H-62),text,font=F(22),fill=MU)
def rr(d,box,fill,r=22,outline=None,width=2): d.rounded_rectangle(box,r,fill=fill,outline=outline,width=width)
def save(im,name): im.save(os.path.join(OUT,name),"WEBP",quality=88,method=6); print(name,im.size)

# 1 summary card
W,H=1200,1500; im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
y=header(d,W,"수국 월동 한눈에 보기","화분·베란다·정원 공통으로 먼저 챙길 여섯 가지")
rows=[("자리","영하로 떨어지지 않는 서늘한 곳. 난방하는 거실은 피하기",SG),
("저온","휴면이 풀리려면 4~7℃ 안팎의 저온이 6주 이상 필요(국내 연구)",SD),
("물","흙이 바싹 마르지 않게. 따뜻한 날 오전에 조금씩",SG),
("가지","가을·겨울에 줄기 끝을 자르지 않기. 마른 꽃은 봄까지 두기",RS),
("보온","화분 감싸기·흙 덮기·바닥 띄우기·찬바람 막기",SG),
("비료","10월부터 중단(농사로 재배 일정)",SD)]
for i,(k,v,c) in enumerate(rows):
    top=y+i*190; rr(d,[64,top,W-64,top+168],c)
    d.ellipse([92,top+44,172,top+124],fill=BR); 
    n=str(i+1); f=F(40,True); d.text((132-d.textlength(n,font=f)/2,top+56),n,font=f,fill="white")
    d.text((204,top+26),k,font=F(40,True),fill=DK)
    para(d,(204,top+82),v,F(32),TX,W-64-204-30,1.35)
footer(d,W,H); save(im,"summary-card.webp")

# 2 steps flow
W,H=1200,1560; im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
y=header(d,W,"수국 월동 준비 순서","11월 중순부터 첫 강추위 전까지 차례대로")
steps=[("비료 끊기","10월부터 비료를 주지 않습니다. 꽃눈을 만들 때는 질소를 낮게 둡니다."),
("마른 꽃 남기기","시든 꽃송이는 자르지 않고 봄까지 둡니다. 아래 꽃눈을 덮어 줍니다."),
("자리 정하기","화분은 영하로 떨어지지 않는 서늘한 베란다 안쪽·빈방으로 옮깁니다."),
("뿌리 보온","화분 겉을 감싸고 흙 위를 덮고, 차가운 바닥에서 띄웁니다."),
("바람 막기","정원 수국은 밑동을 낙엽으로 덮고 북서쪽 찬바람을 막아 줍니다."),
("물 확인","겨울에도 흙 속이 바싹 마르지 않았는지 따뜻한 날 확인합니다.")]
for i,(k,v) in enumerate(steps):
    top=y+i*200; rr(d,[64,top,W-64,top+170],"white",outline=BD)
    rr(d,[64,top,84,top+170],BR,r=8)
    d.text((116,top+24),f"{i+1}단계",font=F(28,True),fill=AC if False else BR)
    d.text((250,top+18),k,font=F(40,True),fill=TX)
    para(d,(116,top+84),v,F(30),MU,W-64-116-30,1.35)
    if i<len(steps)-1:
        cx=W//2; d.polygon([(cx-18,top+176),(cx+18,top+176),(cx,top+196)],fill=AC)
footer(d,W,H); save(im,"steps-flow.webp")

# 3 temperature diagram
W,H=1200,1200; im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
y=header(d,W,"수국 겨울 온도, 어디까지 괜찮을까","온도별로 수국에 일어나는 일 (품종·상태에 따라 다름)")
bands=[("11℃ 이하","꽃눈 분화가 억제되고 휴면이 시작되는 온도 (농사로)",SD,BR),
("4~7℃ 안팎","휴면을 깨는 저온. 6주 이상 필요 (국내 연구)",SG,BR),
("0℃ 아래","휴면이 깨진 뒤의 새싹·꽃눈은 영하에서 상하기 쉬움",RS,WARN),
("약 -18℃","충분히 휴면한 상태에서 견딘다고 알려진 한계 (미국 Ask Extension)",RS,WARN)]
bx=64; top=y+10
for i,(k,v,c,col) in enumerate(bands):
    t=top+i*200; rr(d,[bx,t,W-64,t+176],c)
    d.text((bx+36,t+28),k,font=F(46,True),fill=col)
    para(d,(bx+36,t+96),v,F(30),TX,W-64-bx-72,1.35)
d.text((64,top+4*200+6),"따뜻한 거실에 두면 저온 기간이 모자라 봄 꽃이 줄 수 있습니다.",font=F(30,True),fill=DK)
footer(d,W,H); save(im,"temperature-guide.webp")

# 4 pruning diagram
import math
W,H=1200,1300; im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
y=header(d,W,"수국 가지치기, 언제 어디를 자를까","큰잎수국은 묵은 가지의 눈 속에 이듬해 꽃이 들어 있습니다")
pw=(W-64*2-40)//2
panels=[("가을·겨울: 깊게 자르지 않기",WARN,RS,"마른 꽃 아래 눈까지 자르면 봄 꽃도 함께 사라집니다"),
("이른 봄: 여기서 자르기",BR,SG,"마른 꽃 아래 첫 튼튼한 눈 한 쌍의 바로 위를 자릅니다")]
for j,(title,col,bg,cap) in enumerate(panels):
    x0=64+j*(pw+40); top=y; rr(d,[x0,top,x0+pw,H-110],bg)
    d.text((x0+30,top+24),title,font=F(34,True),fill=col)
    para(d,(x0+30,top+78),cap,F(27),TX,pw-60,1.35)
    cx=x0+pw//2-40; fy=top+290
    for a in range(16):
        ang=a/16*2*math.pi; px=cx+int(math.cos(ang)*62); py=fy+int(math.sin(ang)*42)
        d.ellipse([px-24,py-24,px+24,py+24],fill="#C9A98F",outline="#A88A72",width=2)
    d.ellipse([cx-36,fy-30,cx+36,fy+30],fill="#D4B59B")
    d.line([cx,fy+40,cx,H-160],fill="#7A5A3A",width=16)
    p1=fy+200; p2=fy+400
    for yy,big in ((p1,True),(p2,False)):
        r=26 if big else 20
        d.ellipse([cx-16-2*r,yy-r,cx-16,yy+r],fill="#8FB08F" if big else "#9DB79D")
        d.ellipse([cx+16,yy-r,cx+16+2*r,yy+r],fill="#8FB08F" if big else "#9DB79D")
    d.text((cx+90,fy-16),"마른 꽃",font=F(26,True),fill=TX)
    d.text((cx+90,p1-18),"첫 튼튼한 눈 한 쌍",font=F(26,True),fill=TX)
    d.text((cx+90,p2-18),"아래 눈",font=F(26),fill=MU)
    if j==0:
        cy=p1+90; d.line([cx-100,cy,cx+100,cy],fill=WARN,width=6)
        d.line([cx-150,cy-24,cx-110,cy+24],fill=WARN,width=7); d.line([cx-110,cy-24,cx-150,cy+24],fill=WARN,width=7)
    else:
        cy=p1-70; d.line([cx-100,cy,cx+100,cy],fill=BR,width=6)
        d.polygon([(cx-140,cy-16),(cx-112,cy),(cx-140,cy+16)],fill=BR)
footer(d,W,H,"출처: 영국왕립원예협회(RHS) 수국 가지치기 안내 · flowerhomenote.com"); save(im,"pruning-guide.webp")

# 5 place comparison
W,H=1200,1300; im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
y=header(d,W,"수국 월동 장소 비교","같은 수국이라도 어디서 겨울을 나느냐에 따라 할 일이 다릅니다")
cols=[("화분 · 베란다",SG,BR,["영하로 떨어지지 않는 안쪽","유리창·바닥 냉기 피하기","화분 감싸고 바닥에서 띄우기","맑은 날 낮 환기"]),
("정원 · 노지",SD,DK,["밑동에 낙엽·짚 두껍게","북서쪽 찬바람 막기","부직포는 숨 쉬게 느슨히","봄 새순 나오면 덮개 걷기"]),
("난방하는 거실",RS,WARN,["저온 기간이 모자랄 수 있음","건조한 공기에 꽃눈이 마름","잠깐 피신만, 오래 두지 않기","반려동물이 잎을 씹지 않게"])]
cw=(W-128-40)//3
for i,(t,bg,col,items) in enumerate(cols):
    x0=64+i*(cw+20); rr(d,[x0,y,x0+cw,H-110],bg)
    para(d,(x0+26,y+26),t,F(36,True),col,cw-52,1.25)
    yy=y+130
    for it in items:
        d.ellipse([x0+26,yy+14,x0+42,yy+30],fill=col)
        yy=para(d,(x0+56,yy),it,F(29),TX,cw-80,1.35)+26
footer(d,W,H); save(im,"place-compare.webp")

# 6 printable checklist
W,H=1200,1360; im=Image.new("RGB",(W,H),"white"); d=ImageDraw.Draw(im)
y=header(d,W,"수국 월동 체크리스트","출력하거나 저장해 두고 하나씩 표시하세요")
groups=[("11월",["비료를 멈췄다 (10월부터)","마른 꽃송이를 자르지 않고 남겼다","월동 자리를 정했다 (영하 X, 난방 X)","화분 겉을 감싸고 바닥에서 띄웠다"]),
("한겨울",["흙 속이 바싹 마르지 않았는지 확인했다","물은 따뜻한 날 오전에 조금만 줬다","창가 찬바람·결로가 닿지 않는다","반려동물이 닿지 않는 곳에 두었다"]),
("이른 봄",["새순이 보이면 덮개를 걷었다","늦서리 예보가 있으면 다시 덮었다","마른 꽃을 첫 튼튼한 눈 한 쌍 위에서 잘랐다"])]
for g,items in groups:
    rr(d,[64,y,W-64,y+64],SG,r=14); d.text((92,y+10),g,font=F(34,True),fill=DK); y+=86
    for it in items:
        rr(d,[92,y+6,134,y+48],"white",r=8,outline=BR,width=4)
        d.text((160,y+2),it,font=F(32),fill=TX); y+=66
    y+=20
footer(d,W,H); save(im,"checklist.webp")
