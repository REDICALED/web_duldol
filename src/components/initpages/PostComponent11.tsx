import { useRecoilState } from "recoil";
import pic1_1 from "/images/Works/metamorphosis/1/1.jpg";
import pic1_2 from "/images/Works/metamorphosis/1/2.jpg";
import pic1_3 from "/images/Works/metamorphosis/1/3.jpg";
import pic1_4 from "/images/Works/metamorphosis/1/4.jpg";
import pic2_1 from "/images/Works/metamorphosis/2/1.jpg";
import pic2_2 from "/images/Works/metamorphosis/2/2.jpg";
import pic2_3 from "/images/Works/metamorphosis/2/3.jpg";
import pic2_4 from "/images/Works/metamorphosis/2/4.jpg";
import pic2_5 from "/images/Works/metamorphosis/2/5.jpg";
import pic2_6 from "/images/Works/metamorphosis/2/6.jpg";
import pic3_1 from "/images/Works/metamorphosis/3/1.jpg";
import pic3_2 from "/images/Works/metamorphosis/3/2.jpg";
import pic3_3 from "/images/Works/metamorphosis/3/3.jpg";
import pic3_4 from "/images/Works/metamorphosis/3/4.jpg";
import pic3_5 from "/images/Works/metamorphosis/3/5.jpg";
import pic3_6 from "/images/Works/metamorphosis/3/6.jpg";
import pic3_7 from "/images/Works/metamorphosis/3/7.jpg";
import pic4_1 from "/images/Works/metamorphosis/4/1.jpg";
import pic4_2 from "/images/Works/metamorphosis/4/2.jpg";
import pic4_3 from "/images/Works/metamorphosis/4/3.jpg";
import pic4_4 from "/images/Works/metamorphosis/4/4.jpg";
import Slick from '@/components/Slick';
import { ImageZoom } from "@/atoms/ModalAtom";

const PostComponent11 = () => {
    const [, setImageZoom] = useRecoilState(ImageZoom);

    return (
        <div className=" leading-4 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(pic2_2)}} src={pic2_2} className=' md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>Metamorphosis</span>
            </div>
            <Slick images={[pic1_1, pic1_2, pic1_3, pic1_4]} images_cap={["Metamorphosis_installation view","Metamorphosis_installation view","Metamorphosis_installation view","Metamorphosis_installation view"]}/>

            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <span className='w-full text-xxs md:text-xs m-1'>Metamorphosis</span>
            </div>
            <br />
            <span className=" justify-start flex text-left w-full ">
            ‘불구’는 어딘가 기형의 형태인, 제 기능을 하지 못하는 존재들을 일컫는다. 그런데 사내답지 못하고 여성스럽지 못하거나, 유능하지 못해 실수하고 말을 절거나, 몰래 방구를 뀌고 이에 음식물이 끼거나, 과잉지출 충동구매 하거나, 너무 많이 먹거나, 좋아해서는 안 될 존재를 사랑하거나, 지쳐 멈춰버리거나, 걸려 넘어졌을 나와 당신도 어딘가 불구의 존재스럽다.
            <br />
            <br />

            교양적인 사회인에게 기대되는 태도와 기능을 다하지 못하며 그럴 수밖에 없는 ‘사람’을 볼 때면 정상적 인간의 모습으로 응당 요구되는바, 즉 정상성이 결국 이상성과 같다고 느낀다. ‘이상’과 ‘정상’의 모호한 경계성을 생각함과 동시에 누구나 만족할 수 있을 것만 같은 ‘정상적 표준의 인간’이라는 허들 아래 끝내 이를 넘지 못한 채 남을 우리 모두가 비정상-불구의 인간들 같다고 느낀다.
            <br />
            <br />
            학습한 지향점을 향하는 어딘가 불능의 모자란 존재들.
            <br />
            <br />
            인간은 평생 완벽해질 수 없을 것 같다. 완성될 수도 없을 것 같다. 매일 필요한 끼니와 수건, 옷가지부터 인접한 최소한의 유대관계 속 애정과 인정처럼 기본적인 욕구를 포함해서 끝없이 과거에 가졌던 것 이후의 새로운 것을 욕망한다. 모든 것으로부터 자유로울 방법은 없이, 무언가에는 생존을 의지해야만 하는 인간이기에 완성과 완벽의 상태는 이상으로밖에 남을 수 없다. 머리에 인식된 마땅한 것과 현실의 불완전의 상태는 모순의 형태로 마음 속에 남아서 통합되지 못하는 자신과 세계의 모습에 분열과 불안을 느낄 수 있다. 
            그때에 필요한 것이 용서와 지향점에 대한 끈질긴 의지라고 생각한다.
            분노하고 뒤바꾸되 어쩔 수 없었던 것들을 겸허하게 응시하고 맥락 속에서 이해하고 협상하며, 또한 포기하지 않고 나아지려는 마음을 가질 때 나와 세계는 화해하고 포옹하며 우리는 계속해서 삶을 살아가며 나아갈 수 있다.
            <br />
            <br />
            계속되는 새로운 욕망과 결핍, 다툼과 화해, 성공과 실패, 실수 속에서 새로운 지평은 끝없이 펼쳐지고 우리는 그곳을 계속해서 걸어가며 산다. 태어나 발급받은 설계된 이상과 정상의 규격은 나와 우리 이전에 그려진 전략이기에 벗어나고 달아나서 우리에게 적합한 최적의 장소를 새롭게 그리는 과정 역시 여정에 포함될 것이다. 그렇게 이전에 통합된 단일한 가치 기준과 삶의 방식은 통용되지 않게 되고 개체들 각각이 자신의 방식을 찾아 분열되고 기존의 지대는 기울어지고 무너진다. 하지만 그 속 무너지고 헐거워진 생명들이 갖는 에너지를 믿는다. 
            각별한 무언가를 위해 삶을 살아가든, 태어났기에 혹은 죽는 것은 두려워 삶을 살든 간에 살기로 한 생명들. 
            그렇게 이들이 끝내 선택하고 의지want하는 재생, 회복, 재건설.
            <br />
            <br />
            마땅하다는 것들로부터 벗어나길 택하고 유목적으로 떠다니는 개인들의 재생력과 생명력은 함께 모여, 무너지기 이전보다 원하는 대로 뻗어가 더 나은 새세계를 건설할 수 있다고 생각한다.
            <br />
            <br />
            그런 미완성, 결코 완성될 일 없는 불완성의 존재들이 달아나고 달려가고 부서지고 무너지고 다시 세우며 삶을 살아가는 이야기를 하고 싶다.
            </span>
            <br />

            <Slick images={[pic2_1, pic2_2, pic2_3, pic2_4, pic2_5, pic2_6]} images_cap={["Metamorphosis 1_148*108(cm)_장지에 연필과 아크릴_2023","Metamorphosis 1_부분도", "Metamorphosis 2_150*113(cm)_종이에 연필과 아크릴_ 2023", "Metamorphosis 2_부분도", "Metamorphosis 3_150*140(cm)_종이에 연필, 아크릴 물감, 흑연, 제스모나이트,석고, 종이죽_2023","Metamorphosis 3_부분도" ]}/>
            
            <Slick images={[pic3_1, pic3_2, pic3_3, pic3_4, pic3_5, pic3_6, pic3_7]} images_cap={["Metamorphosis 5_20*18*9(cm) 내외_작업 과정 중의 미완성 파편들을 레진, 글루건, 제스모나이트와 석고로 한데 뭉침_2023","Metamorphosis 5_20*18*9(cm) 내외_작업 과정 중의 미완성 파편들을 레진, 글루건, 제스모나이트와 석고로 한데 뭉침_2023", "Metamorphosis 5_20*18*9(cm) 내외_작업 과정 중의 미완성 파편들을 레진, 글루건, 제스모나이트와 석고로 한데 뭉침_2023", "Metamorphosis 5_20*18*9(cm) 내외_작업 과정 중의 미완성 파편들을 레진, 글루건, 제스모나이트와 석고로 한데 뭉침_2023","Metamorphosis 5_20*18*9(cm) 내외_작업 과정 중의 미완성 파편들을 레진, 글루건, 제스모나이트와 석고로 한데 뭉침_2023", "Metamorphosis 5_부분도", "Metamorphosis 5_부분도"   ]}/>

            <span className=" justify-start flex text-left w-full ">
            진행하다 멈춰뒀던 작업들이 작업실에 점점 쌓였다. 이들을 한 데 모아 레진, 글루건, 석고 등의 접착제로 동그랗게 뭉쳤다. 동그랗고 맨들한 덩어리들은 알과 유사한 형태를 띄고 있다.
            <br />
            <br />
 
            완성된 작업을 보러 놀러 온 친구들은 이들을 둥글게 둘러싸고 만지며 바라보았다. 산실에서 막 태어난 아기를 바라보는 가족들과 같았다. 다만 이들은 아직 태어나길 기다리고 있다.
            <br />
            <br />
            </span>
            <div className=" justify-start flex text-left w-full ">
                <iframe src="https://player.vimeo.com/video/898474520?autoplay=0" className="w-full md:h-[550px]" ></iframe>
            </div>
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <span className='w-full text-xxs md:text-xs m-1'>Metamorphosis 4_1 channel, 4 moving images_00:00:29_2023</span>
            </div>
            <br />

            <span className=" justify-start flex text-left w-full ">
            기울기를 안기
            <br />
            <br />
            달아나기 
            <br />
            달아나기 
            <br />
            가시 뽑기 
            <br />
            혼자 걷기 
            <br />
            <br />
            벗어나기 
            <br />
            지각하기 
            <br />
            통일되기
            <br />
            <br />
            반쯤 잠겨 녹여 나를 속여 
            <br />
            안으로 들어가 당당해
            <br />
            소리 없는 무게로 나의 기울기를 껴안기 
            <br />
            <br />

            달콤한 각도로
            <br />
            나를 믿고
            <br />
            무너져 결합되고 
            <br />
            기울어져 
            <br />
            균형짓고
            <br />
            <br />

            웅크려져 통일되기
            <br />
            합쳐 동그랗게 살아남기 
            <br />
            모여있는 곰은 
            <br />
            검은 구멍 지어 
            <br />
            <br />

            껴안아
            <br />
            <br />

            공중의 도시를 건설해 우리

            </span>

            <br />
            <Slick images={[pic4_1, pic4_2, pic4_3, pic4_4]} images_cap={["Metamorphosis 4_1 channel, 4 moving images, still cut_00:00:29_2023","Metamorphosis 4_1 channel, 4 moving images, still cut_00:00:29_2023","Metamorphosis 4_1 channel, 4 moving images, still cut_00:00:29_2023","Metamorphosis 4_1 channel, 4 moving images, still cut_00:00:29_2023"]}/>

        </div>
    );
}

export default PostComponent11;