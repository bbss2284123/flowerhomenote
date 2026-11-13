from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math
OUT="/workspace/blog3/repo/public/images/posts/hydrangea-winter-care"
S=2
B="/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"; R="/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
def F(s,b=False): return ImageFont.truetype(B if b else R, int(s*S), index=1)
BG=(252,251,248); BR=(65,103,67); DK=(53,92,69); TX=(39,51,34); MU=(92,106,96); SG=(234,241,231); SD=(244,235,220); RS=(248,232,228); AC=(215,137,129); BD=(230,228,220); WARN=(140,78,74); WH=(255,255,255)
class C:
    def __init__(s,W,H):
        s.W,s.H=W,H; s.im=Image.new("RGB",(W*S,H*S),BG); s.d=ImageDraw.Draw(s.im)
    def card(s,box,fill=WH,r=26,shadow=True,outline=None):
        x0,y0,x1,y1=[v*S for v in box]
        if shadow:
            sh=Image.new("RGBA",s.im.size,(0,0,0,0)); sd=ImageDraw.Draw(sh)
            sd.rounded_rectangle([x0,y0+8*S,x1,y1+8*S],r*S,fill=(31,50,34,34))
            sh=sh.filter(ImageFilter.GaussianBlur(14*S))
            s.im.paste(sh,(0,0),sh); s.d=ImageDraw.Draw(s.im)
        s.d.rounded_rectangle([x0,y0,x1,y1],r*S,fill=fill,outline=outline,width=2*S if outline else 0)
    def text(s,xy,t,font,fill): s.d.text((xy[0]*S,xy[1]*S),t,font=font,fill=fill)
    def tl(s,t,font): return s.d.textlength(t,font=font)/S
    def wrap(s,t,font,w):
        lines=[]
        for para in t.split("\n"):
            cur=""
            for ch in para:
                if s.tl(cur+ch,font)>w and cur:
                    sp=cur.rfind(" ")
                    if sp>0: lines.append(cur[:sp]); cur=cur[sp+1:]+ch
                    else: lines.append(cur); cur=ch
                else: cur+=ch
            lines.append(cur)
        return lines
    def para(s,xy,t,font,fill,w,lh=1.5):
        x,y=xy
        for l in s.wrap(t,font,w):
            s.text((x,y),l,font,fill); y+=font.size/S*lh
        return y
    def header(s,title,sub=None,kicker="꽃과살림노트  ·  수국 월동"):
        f=F(24,True); w=s.tl(kicker,f)+40
        s.d.rounded_rectangle([64*S,56*S,(64+w)*S,98*S],21*S,fill=SG)
        s.text((84,61),kicker,f,BR)
        y=s.para((64,122),title,F(56,True),TX,s.W-128,1.28)
        if sub: y=s.para((64,y+10),sub,F(28),MU,s.W-128,1.5)
        s.d.rounded_rectangle([64*S,(y+22)*S,124*S,(y+28)*S],3*S,fill=AC)
        return y+60
    def num(s,cx,cy,n,r=34,fill=BR):
        s.d.ellipse([(cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S],fill=fill)
        f=F(32,True); t=str(n); s.text((cx-s.tl(t,f)/2,cy-25),t,f,WH)
    def footer(s,t="참고: 농촌진흥청 농사로 · 영국왕립원예협회(RHS) · 미국 Ask Extension"):
        s.d.line([64*S,(s.H-80)*S,(s.W-64)*S,(s.H-80)*S],fill=BD,width=2*S)
        s.text((64,s.H-62),t,F(21),MU)
        f=F(21,True); u="flowerhomenote.com"; s.text((s.W-64-s.tl(u,f),s.H-62),u,f,BR)
    def save(s,name):
        out=s.im.resize((s.W,s.H),Image.LANCZOS); p=os.path.join(OUT,name)
        for q in (92,88,84,80):
            out.save(p,"WEBP",quality=q,method=6)
            if os.path.getsize(p)<=150000: break
        print(name,out.size,os.path.getsize(p))

# 1 summary
c=C(1200,1560); y=c.header("수국 월동 한눈에 보기","화분·베란다·정원 공통으로 먼저 챙길 여섯 가지")
rows=[("자리","영하로 떨어지지 않는 서늘한 곳. 난방하는 거실은 오래 두지 않기",SG),
("저온","휴면이 풀리려면 4~7℃ 안팎의 저온이 6주 이상 필요(국내 연구)",SD),
("물","흙 속이 바싹 마르지 않게, 따뜻한 날 오전에 조금씩",SG),
("가지","가을·겨울엔 줄기 끝을 자르지 않기. 마른 꽃은 봄까지 두기",RS),
("보온","화분 감싸기 · 흙 덮기 · 바닥 띄우기 · 찬바람 막기",SG),
("비료","10월부터 쉬기(농사로 재배 일정)",SD)]
for i,(k,v,col) in enumerate(rows):
    t=y+i*188; c.card([64,t,1136,t+164],WH)
    c.num(150,t+82,i+1,fill=BR if i%2==0 else DK)
    c.text((214,t+26),k,F(38,True),DK)
    c.para((214,t+82),v,F(29),TX,880,1.4)
c.footer(); c.save("summary-card.webp")

# 2 steps
c=C(1200,1640); y=c.header("수국 월동 준비 순서","11월 중순부터 첫 강추위 전까지, 위에서 아래로 하나씩")
steps=[("비료 쉬기","10월부터 비료를 주지 않아요. 꽃눈을 만들 땐 질소를 낮게 둬요."),
("마른 꽃 남기기","시든 꽃송이는 봄까지 그대로. 아래 꽃눈을 덮어 줘요."),
("자리 정하기","영하로 떨어지지 않는 서늘한 베란다 안쪽이나 빈방으로."),
("뿌리 보온","화분 겉을 감싸고, 흙 위를 덮고, 차가운 바닥에서 띄워요."),
("바람 막기","정원 수국은 밑동을 낙엽으로 덮고 북서쪽 찬바람을 막아요."),
("물 확인","겨울에도 흙 속이 바싹 마르지 않았는지 따뜻한 날 확인해요.")]
for i,(k,v) in enumerate(steps):
    t=y+i*206
    if i<len(steps)-1: c.d.line([150*S,(t+150)*S,150*S,(t+206+10)*S],fill=BD,width=4*S)
    c.card([64,t,1136,t+170],WH)
    c.num(150,t+85,i+1,r=38)
    c.text((222,t+24),f"STEP {i+1}",F(20,True),AC)
    c.text((222,t+50),k,F(36,True),TX)
    c.para((222,t+106),v,F(27),MU,880,1.4)
c.footer(); c.save("steps-flow.webp")

# 3 temperature
c=C(1200,1360); y=c.header("수국 겨울 온도, 어디까지 괜찮을까","온도별로 수국에 일어나는 일 · 품종과 상태에 따라 달라요")
bands=[("11℃ 이하","꽃눈 분화가 억제되고 휴면이 시작돼요 (농사로)",(222,236,218),BR),
("4~7℃ 안팎","휴면을 깨는 저온, 6주 이상 필요해요 (국내 연구)",(234,241,231),BR),
("0℃ 아래","휴면이 깨진 뒤의 새싹·꽃눈은 영하에서 상하기 쉬워요",(248,232,228),WARN),
("약 -18℃","충분히 휴면한 상태에서 견딘다고 알려진 한계 (Ask Extension)",(243,221,216),WARN)]
# gradient thermometer
tx=110; top=y+10; bot=y+4*196-30
for yy in range(int(top*S),int(bot*S)):
    f=(yy/S-top)/(bot-top); col=tuple(int(a+(b-a)*f) for a,b in zip((127,161,132),(215,137,129)))
    c.d.line([(tx-10)*S,yy,(tx+10)*S,yy],fill=col)
c.d.ellipse([(tx-24)*S,(bot-14)*S,(tx+24)*S,(bot+34)*S],fill=AC)
for i,(k,v,col,tc) in enumerate(bands):
    t=y+i*196; c.card([180,t,1136,t+168],WH)
    c.d.ellipse([(tx-16)*S,(t+70)*S,(tx+16)*S,(t+102)*S],fill=WH,outline=tc,width=5*S)
    c.text((226,t+24),k,F(44,True),tc)
    c.para((226,t+94),v,F(28),TX,880,1.4)
yb=y+4*196+6; c.card([64,yb,1136,yb+96],SG,shadow=False)
c.text((96,yb+26),"따뜻한 거실에 오래 두면 저온이 모자라 봄 꽃이 줄 수 있어요",F(28,True),DK)
c.footer(); c.save("temperature-guide.webp")

# 4 pruning
c=C(1200,1360); y=c.header("수국 가지치기, 언제 어디를 자를까","큰잎수국은 묵은 가지의 눈 속에 이듬해 꽃이 들어 있어요")
pw=(1200-128-40)//2
panels=[("가을·겨울","깊게 자르지 않기",WARN,RS,"마른 꽃 아래 눈까지 자르면 봄 꽃도 함께 사라져요"),
("이른 봄","여기서 자르기",BR,SG,"마른 꽃 아래 첫 튼튼한 눈 한 쌍의 바로 위를 잘라요")]
for j,(when,title,col,bg,cap) in enumerate(panels):
    x0=64+j*(pw+40); t=y; c.card([x0,t,x0+pw,1250],WH)
    c.d.rounded_rectangle([x0*S,t*S,(x0+pw)*S,(t+150)*S],26*S,fill=bg); c.d.rectangle([x0*S,(t+120)*S,(x0+pw)*S,(t+150)*S],fill=bg)
    c.text((x0+30,t+22),when,F(24,True),col); c.text((x0+30,t+54),title,F(36,True),TX)
    c.para((x0+30,t+168),cap,F(25),MU,pw-60,1.45)
    cx=x0+pw//2-50; fy=t+340
    import random; rnd=random.Random(7)
    pts=[]
    while len(pts)<34:
        px=rnd.uniform(-72,72); py=rnd.uniform(-52,40)
        if (px/72)**2+((py+6)/48)**2<=1: pts.append((px,py))
    pts.sort(key=lambda p:p[1])
    for px,py in pts:
        x,yv=cx+px,fy+py; r=15
        shade=rnd.randint(-14,10); colf=(206+shade,180+shade,160+shade)
        for k in range(4):
            a=k*math.pi/2+math.pi/4; ox=math.cos(a)*8; oy=math.sin(a)*8
            c.d.ellipse([(x+ox-r*0.7)*S,(yv+oy-r*0.7)*S,(x+ox+r*0.7)*S,(yv+oy+r*0.7)*S],fill=colf,outline=(170,145,125),width=S)
        c.d.ellipse([(x-3)*S,(yv-3)*S,(x+3)*S,(yv+3)*S],fill=(150,120,100))
    c.d.rounded_rectangle([(cx-8)*S,(fy+40)*S,(cx+8)*S,1200*S],8*S,fill=(122,90,58))
    p1=fy+200; p2=fy+390
    for yy,r,colb in ((p1,26,(127,161,132)),(p2,20,(157,183,157))):
        c.d.ellipse([(cx-12-2*r)*S,(yy-r)*S,(cx-12)*S,(yy+r)*S],fill=colb)
        c.d.ellipse([(cx+12)*S,(yy-r)*S,(cx+12+2*r)*S,(yy+r)*S],fill=colb)
    c.text((cx+105,fy-18),"마른 꽃",F(24,True),TX)
    c.text((cx+90,p1-18),"첫 튼튼한 눈 한 쌍",F(24,True),TX)
    c.text((cx+90,p2-18),"아래 눈",F(24),MU)
    if j==0:
        cy=p1+95; c.d.line([(cx-110)*S,cy*S,(cx+110)*S,cy*S],fill=WARN,width=6*S)
        c.d.ellipse([(cx-170)*S,(cy-26)*S,(cx-118)*S,(cy+26)*S],fill=WARN)
        c.d.line([(cx-155)*S,(cy-11)*S,(cx-133)*S,(cy+11)*S],fill=WH,width=5*S); c.d.line([(cx-133)*S,(cy-11)*S,(cx-155)*S,(cy+11)*S],fill=WH,width=5*S)
    else:
        cy=p1-75
        for xx in range(int((cx-110)*S),int((cx+110)*S),int(22*S)): c.d.line([xx,cy*S,xx+12*S,cy*S],fill=BR,width=6*S)
        c.d.ellipse([(cx-170)*S,(cy-26)*S,(cx-118)*S,(cy+26)*S],fill=BR)
        c.d.line([(cx-156)*S,cy*S,(cx-146)*S,(cy+11)*S],fill=WH,width=5*S); c.d.line([(cx-146)*S,(cy+11)*S,(cx-130)*S,(cy-11)*S],fill=WH,width=5*S)
c.footer("참고: 영국왕립원예협회(RHS) 수국 가지치기 안내"); c.save("pruning-guide.webp")

# 5 place compare
c=C(1200,1000); y=c.header("수국 월동 장소 비교","겨울을 나는 곳에 따라 할 일이 조금씩 달라요")
cols=[("화분 · 베란다","추천",SG,BR,["영하로 떨어지지 않는 안쪽","유리창·바닥 냉기 피하기","화분 감싸고 바닥에서 띄우기","맑은 날 낮 잠깐 환기"]),
("정원 · 노지","준비 필요",SD,DK,["밑동에 낙엽·짚 두껍게","북서쪽 찬바람 막기","부직포는 숨 쉬게 느슨히","봄 새순 나오면 덮개 걷기"]),
("난방하는 거실","잠깐만",RS,WARN,["저온 기간이 모자랄 수 있음","건조한 공기에 꽃눈이 마름","한파 때 잠깐 피신만","반려동물이 닿지 않게"])]
cw=(1200-128-48)//3
for i,(t,tag,bg,col,items) in enumerate(cols):
    x0=64+i*(cw+24); c.card([x0,y,x0+cw,890],WH)
    c.d.rounded_rectangle([x0*S,y*S,(x0+cw)*S,(y+150)*S],26*S,fill=bg); c.d.rectangle([x0*S,(y+120)*S,(x0+cw)*S,(y+150)*S],fill=bg)
    f=F(20,True); w=c.tl(tag,f)+28
    c.d.rounded_rectangle([(x0+24)*S,(y+24)*S,(x0+24+w)*S,(y+58)*S],17*S,fill=WH)
    c.text((x0+38,y+27),tag,f,col)
    c.para((x0+24,y+72),t,F(32,True),TX,cw-48,1.25)
    yy=y+184
    for it in items:
        c.d.ellipse([(x0+26)*S,(yy+12)*S,(x0+42)*S,(yy+28)*S],fill=col)
        yy=c.para((x0+56),yy) if False else c.para((x0+56,yy),it,F(27),TX,cw-84,1.4)+30
c.footer(); c.save("place-compare.webp")

# 6 checklist
c=C(1200,1460); y=c.header("수국 월동 체크리스트","저장하거나 출력해 두고 하나씩 체크해 보세요")
groups=[("11월",["비료를 멈췄다 (10월부터)","마른 꽃송이를 자르지 않고 남겼다","월동 자리를 정했다 (영하 X, 난방 X)","화분 겉을 감싸고 바닥에서 띄웠다"]),
("한겨울",["흙 속이 바싹 마르지 않았는지 확인했다","물은 따뜻한 날 오전에 조금만 줬다","창가 찬바람·결로가 닿지 않는다","반려동물이 닿지 않는 곳에 두었다"]),
("이른 봄",["새순이 보이면 덮개를 걷었다","늦서리 예보가 있으면 다시 덮었다","마른 꽃을 첫 튼튼한 눈 한 쌍 위에서 잘랐다"])]
for g,items in groups:
    h=74+len(items)*62+20; c.card([64,y,1136,y+h],WH)
    c.d.rounded_rectangle([64*S,y*S,1136*S,(y+64)*S],26*S,fill=SG); c.d.rectangle([64*S,(y+40)*S,1136*S,(y+64)*S],fill=SG)
    c.text((96,y+12),g,F(30,True),DK)
    yy=y+86
    for it in items:
        c.d.rounded_rectangle([96*S,(yy+4)*S,136*S,(yy+44)*S],10*S,fill=WH,outline=BR,width=3*S)
        c.text((160,yy),it,F(29),TX); yy+=62
    y+=h+28
c.footer(); c.save("checklist.webp")
