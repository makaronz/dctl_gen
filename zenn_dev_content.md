# Zawartość strony - Zenn.Dev

*Wygenerowano: 2025-06-25 07:30:25*

**Źródło:** [zenn.dev](https://zenn.dev/omakazu/articles/0d63566ebea6d3)

---

## 📋 Spis Treści

- [1. DCTL syntax memo](#dctl-syntax-memo)
- [2. Zenn](#zenn)
- [3. omakazu](#omakazu)
- [4. davinci](#davinci)
- [5. resolve](#resolve)
- [6. dctl](#dctl)

---

## 1. DCTL syntax memo

**URL:** https://zenn.dev/omakazu/articles/0d63566ebea6d3

[Zenn](https://zenn.dev/)

目次
🤖
# DCTL syntax memo
2024/05/26に公開
2024/12/22
2
[](https://twitter.com/intent/tweet?url=https://zenn.dev/omakazu/articles/0d63566ebea6d3&text=DCTL%20syntax%20memo%EF%BD%9Comakazu&hashtags=zenn)[](http://www.facebook.com/sharer.php?u=https://zenn.dev/omakazu/articles/0d63566ebea6d3)[](https://b.hatena.ne.jp/add?mode=confirm&url=https://zenn.dev/omakazu/articles/0d63566ebea6d3&title=DCTL%20syntax%20memo%EF%BD%9Comakazu)

DaVinci CTLについてのメモ 随時追記 最終更新 : 2024/12/22 structとswizzle周りの記載
`/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/DaVinciCTL`にblackmagic側が用意しているsampleが用意されている。
> The DCTL syntax is C-like with additional definitions. Users can define functions using DCTL code to create a video effect, save it to file, and run it in Resolve. Such an effect serves as a "pixel shader" program - i.e. it defines a process to generate one pixel of data at a time at each given frame's coordinates. DCTL code is GPU accelerated in DaVinci Resolve across different platforms and graphics sub-systems.
C-likeな書き方で、GLSLのフラグメントシェーダーのようなピクセルに対してGPUに働きかけるようなシステム。
> In Resolve, DCTL effects can be run as a color LUT, using the DCTL OFX plugin or the Transition Plugin. DCTL effects are commonly saved as a plain text .dctl files, but if needed, developers can further save an encrypted effect as a .dctle file for distribution. See Encryption under Types of DCTLs.
LUTと同様に実行させるか、DCTL OFXからDCTLで実行させるか、Edit pageより、DCTL Transitionとして 実行させるかの3パターンの方法がある。
> There are two main types of DCTLs: - A transform DCTL applies an effect to each frame of a single clip. - A transition DCTL applies an effect that blends frames from two clips over time.
> A Transform DCTL performs a color transform or creates an effect (e.g increasing a frame's brightness - refer to the Gain.dctl example included). Users can apply the Transform DCTL in 4 ways:
> * Create a color correction node, open context menu, and apply through LUT selection - Create a color correction node, add the ResolveFX DCTL plugin, and select the desired DCTL file from DCTL list. - On LUT Browser, preview result and choose Apply LUT to Current Node - Open clip thumbnail's context menu and apply through LUT selection
> 

> A Transition DCTL creates a scene transition, such as a dissolve blending between 2 clips (refer to DissolveTransition.dctl sample). Transition DCTLs can only be used in the OpenFX DCTL Transition Plugin (which is located in [ Resolve > Edit Page > OpenFX > Transition > ResolveFX Color > DCTL ]). The DCTL transition plugin is used in the same way as any other transition plugins (Resolve's Video Transitions, OpenFX transitions,...). After adding the plugin, users can select a DCTL file from the DCTL List and the corresponding transition effect will be applied.
主に、`Transform DCTL`と`Transition DCTL`という種類に分けらられる。 Transform DCTLが、一つのclipに対して影響するもので、Transition DCTLは2つのクリップをブレンドするように影響させるような時に使える。
encryptionとして配布したい場合は`.dctle`として出力することができる。DaVinci resolve LUT Browserより出力することができる。
> Encryption: In Resolve, users can encrypt a .dctl file with an expiry date to distribute an effect without revealing the content. The encrypted .dctle can be distributed and used normally in any of Resolve's systems until it expires.
> To encrypt a DCTL: From the LUT browser, select the desired .dctl file, open context menu, choose "Encrypt DCTL" option. A helper dialog will appear for user to set name, expiration date and output folder for the encrypted DCTL. The encrypted DCTL will have a .dctle extension.
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#dctl-type) DCTL type
基本はint, float, char*, pointerなど、c-likeのものが実装されていて、
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#enum) enum
enumも実装されていそうな感じ。Cのルールと一緒っぽい。
```
enum white_reference_points {
  //列挙子の定義
  D50,
  D55,
  D65,
  D75,
  D93,
  A,
  B,
  C,
  E,
  F2,
  F7,
  F11
};
enum white_reference_points w1;
w1 = D50;
//DCTLの__CONSTANT__でもenumも動きそう
__CONSTANT__ enum white_reference_points CIEXYZ_1931_white_point = E;

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
DCTLオリジナルのtypeは以下のものがある。
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#texture) **TEXTURE**
`type for a texture reference.`
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#float2%2C-float3%2C-float4) float2, float3, float4
GLSLのvec2, vec3的なvectorの型
> The utility functions make_float2(float,float), make_float3(float,float,float) and make_float4(float,float,float,float) can be used to contruct them.
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#swizzle) swizzle
GLSLであるようなswizzleも対応している。 .x, .y, .z, .w
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#initialize) initialize
functionも実装されていて、**make_float2(float,float)** , **make_float3(float, float, float)** , **make_float(float, float, float, float)**などでfloat2,3,4を作ることができる。
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#%E5%AE%9A%E7%BE%A9%E3%81%AE%E3%81%BF) 定義のみ
下記のような`float3 out`みたいに空のfloat3を定義することもできる。 その後に、`out.x = `みたいにして具体的な値を入れるのでもsyntax上問題なし。 initializeしたい時は`make_float3(float, float, float)`みたいに宣言しないといけない。
```

__DEVICE__ float min( float a, float b)
{
 if (a < b)
  return a;
 else
  return b;
}
__DEVICE__ float max( float a, float b)
{
 if (a > b)
  return a;
 else
  return b;
}
__DEVICE__ float min_f3( float3 a)
{
 return min( a.x, min( a.y, a.z));
}
__DEVICE__ float max_f3( float3 a)
{
 return max( a.x, max( a.y, a.z));
}
__DEVICE__ float clip( float v)
{
 return min(v, 1.0);
}
__DEVICE__ float3 clip_f3( float3 in)
{
  float3 out;
  out.x = clip( in.x);
  out.y = clip( in.y); 
  out.z = clip( in.z);
  return out;
}
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B) {
  float3 in = make_float3(p_R,p_G,p_B);
  float3 test = clip_f3(in);
  return make_float3(0.0,1.0,0.0);

}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#%E4%BF%AE%E9%A3%BE%E5%AD%90\(qualifier\)) 修飾子(qualifier)
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#device) **DEVICE**
関数を定義するための修飾子。
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#constant) **CONSTANT**
定数メモリを定義するための修飾子。
```
__CONSTANT__ float NORM[] = {1.0f / 3.0f, 1.0f / 3.0f, 1.0f / 3.0f};

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
RGB to XYZ系のmatrixも以下のような感じで実装できる。
```
__CONSTANT__ float CIEXYZ_1931_Primary[8] = {1.0f,0.0f,0.0f,1.0f,0.0f,0.0f,E_xyz[0],E_xyz[1]};
__CONSTANT__ float CIEXYZ_1931_PrimaryZ[4] = {
  1- CIEXYZ_1931_Primary[0] - CIEXYZ_1931_Primary[1],
  1- CIEXYZ_1931_Primary[2] - CIEXYZ_1931_Primary[3],
  1- CIEXYZ_1931_Primary[4] - CIEXYZ_1931_Primary[5],
  1- CIEXYZ_1931_Primary[6] - CIEXYZ_1931_Primary[7],
};
// #白色点の正規化（yが1になる様にスケール）
__CONSTANT__ float3 CIEXYZ_1931_Wn = {
  CIEXYZ_1931_Primary[6]/CIEXYZ_1931_Primary[7],
  CIEXYZ_1931_Primary[7]/CIEXYZ_1931_Primary[7],
  CIEXYZ_1931_PrimaryZ[3]/CIEXYZ_1931_Primary[7],
};
__CONSTANT__ float CIEXYZ_1931_M[3][3] = {
  {CIEXYZ_1931_Primary[0], CIEXYZ_1931_Primary[2], CIEXYZ_1931_Primary[4]},
  {CIEXYZ_1931_Primary[1], CIEXYZ_1931_Primary[3], CIEXYZ_1931_Primary[5]},
  {CIEXYZ_1931_PrimaryZ[0], CIEXYZ_1931_PrimaryZ[1], CIEXYZ_1931_PrimaryZ[2]}
};

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#constantref) **CONSTANTREF**
関数に渡される定数メモリのパラメータの修飾子。 つまり、関数の引数として定数のメモリを渡したい時に使われる修飾子。
```

__CONSTANT__ float testconst = 1.0f/3.0f;
//メモリを受け取っている。
__DEVICE__ float DoSomething(__CONSTANTREF__ float* p_Params){
	fogafogafogafoga;
	fogafogafogafoga;
	return fogafoga;
}
......
......
......
const float result = DoSomething(&testconst);//メモリを渡している。

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#typedef-struct) typedef struct
```
typedef struct
{
	float c00, c01, c02;
	float c10, c11, c12;
} Matrix;

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
どうやら、structは関数でreturnできるらしい matrixの実装が配列でやるとめっちゃくちゃめんどくさいと思っていたら float3 structはreturnできるみたいだから楽になることがわかった
```
typedef struct {
  float x, y, z, w, m;
} float5;
typedef struct {
  float3 c0, c1, c2;
} mat3;
typedef struct {
  float2 red;
  float2 green;
  float2 blue;
  float2 white;
} Chromaticities;
__DEVICE__ float3 max_f3_f( float3 a, float b) {
  float3 out;
  out.x =_fmaxf(a.x, b);
  out.y =_fmaxf(a.y, b);
  out.z =_fmaxf(a.z, b);
  return out;
}
__DEVICE__ mat3 make_mat3( float3 A, float3 B, float3 C) {
  mat3 D;
  D.c0 = A;
  D.c1 = B;
  D.c2 = C;
  return D;
}

__DEVICE__ mat3 mult_f_f33( float f, mat3 A) {
  float r[3][3];
  float a[3][3] = {{A.c0.x, A.c0.y, A.c0.z}, {A.c1.x, A.c1.y, A.c1.z}, {A.c2.x, A.c2.y, A.c2.z}};
  for( int i = 0; i < 3; ++i ){
 for( int j = 0; j < 3; ++j ){
 r[i][j] = f * a[i][j];
 }
  }
  mat3 R = make_mat3(make_float3(r[0][0], r[0][1], r[0][2]), make_float3(r[1][0], r[1][1], r[1][2]), make_float3(r[2][0], r[2][1], r[2][2]));
  return R;
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
<https://github.com/baldavenger/ACES_DCTL/blob/master/ACES_ADX_REC709_OFX.dctl>
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#matrix) matrix
structでmatrix作る際に、デフォルト値をつけておきたい時
```
typedef struct mat33{
  float3 m0 {make_float3(1.0f, 0.0f, 0.0f)};
  float3 m1 {make_float3(0.0f, 1.0f, 0.0f)};
  float3 m2 {make_float3(0.0f, 0.0f, 1.0f)};
} mat33;
// 4x4 matrix
typedef struct mat44{
  float4 m0 {make_float4(1.0f, 0.0f, 0.0f, 0.0f)};
  float4 m1 {make_float4(0.0f, 1.0f, 0.0f, 0.0f)};
  float4 m2 {make_float4(0.0f, 0.0f, 1.0f, 0.0f)};
  float4 m3 {make_float4(0.0f, 0.0f, 0.0f, 1.0f)};
} mat44;

__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B) {
  mat33 M;
  //blueの画面になる。
  return make_float3(M.m2.x, M.m2.y, M.m2.z);
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
```
__DEVICE__ mat44 test_test(mat33 M_3)
{
  mat44 M_4;
  M_4.m0 = make_float4(M_3.m0.x, M_3.m0.y, M_3.m0.z, 0.0f);
  M_4.m1 = make_float4(M_3.m1.x, M_3.m1.y, M_3.m1.z,0.0f);
  M_4.m2 = make_float4(M_3.m2.x, M_3.m2.y, M_3.m2.z,0.0f);
  M_4.m3 = make_float4(0.0f, 0.0f, 0.0f, 1.0f);
  return M_4;

}
__DEVICE__ mat33 make_mat33( float3 A, float3 B, float3 C)
{
  mat33 D;
  D.m0 = A;
  D.m1 = B;
  D.m2 = C;
  return D;
}
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B) {
  mat33 M33;

  mat44 M44 = { make_float4( -1./6, 3./6, -3./6, 1./6 ),
 make_float4( 3./6, -6./6, 3./6, 0./6 ),
 make_float4( -3./6, 0./6, 3./6, 0./6 ),
 make_float4( 1./6, 4./6, 1./6, 0./6 )
  };
  // mat44 _M; 
  float3 A = make_float3(0.0,0.0,0.0);
  float3 B = make_float3(0.0,0.0,0.0);
  float3 C = make_float3(0.0,0.0,0.0);
  M33 = make_mat33(A,B,C);
  
  mat44 a = test_test(M33);

  // 
  // return make_float3(1.0f, 0.0f, 0.0f);
  return make_float3(a.m2.x, a.m2.y, a.m2.z);
  // return make_float3(_M.m0.x,1.0,0.0);

}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
<https://www.learncpp.com/cpp-tutorial/default-member-initialization/>
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#float5) float5
float5を作ってdefault値をつけたい時は以下の感じで大丈夫。 `{}`の中に具体的な値を書けばそれがdefaultvalueになる。{}にしとけば、その型のdefault valueになるはず。
```
typedef struct float5{
  float x {};
  float y {};
  float z {};
  float w {};
  float m {};
} float5;

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#syntax) Syntax
> Each DCTL file must use a single main entry function called 'transform()' or 'transition()', with the function signatures shown below. NOTE: Use the function definition below exactly as-is - including parameter types and names.
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#transform-dctl) Transform DCTL
**Transform DCTLを使用したい場合** 基本として、etnryとなるfucntionは以下のように定義する。
```
# The Transform entry function for a Transform DCTL should be one of:
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, __TEXTURE__ p_TexR, __TEXTURE__ p_TexG, __TEXTURE__ p_TexB)

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Parameters: * p_Width and p_Height - the image resolution. * p_X and p_Y - the pixel coordinates where the transform function does the color transformation. * The (p_R, p_G, p_B) - input pixel's RGB values (in the first signature). * The (p_TexR, p_TexG, p_TexB) in the second signature - texture references to the RGB planes.
> The function can request the RGB values for any pixel from the image by calling _tex2D([textureVariable], [posX], [posY]), which returns a float value (posX and posY being the desired input pixel coordinates).
`_tex2D()`で、それぞれのchannnelのtexture変数からpixel valueをゲットすることができる。
!
GLSLと雰囲気が違うのは、texture変数はR,G,B,Aのそれぞれ単体のtexture変数になっていてるため、returnはvectorでRGBAではなく、floatで任意のチェンネルが返ってくる。
> This function performs a pixel transformation at offset (p_X, p_Y) on a single image (0, 0, p_Width, p_Height) with the input parameters provided.
この関数は，与えられた引数を用いて，1つの画像（0, 0, p_Width, p_Height）に対して，オフセット（p_X, p_Y）でピクセル変換を行う。
> Both transform functions return a float3 (RGB) value for each pixel at the coordinates (p_X, p_Y) for the result image.
このtransform()では最終的にreturnとして`float3(RGB)`を返す。それぞれのp_X, p_Yの座標の時にその色が反映される。
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#transition-dctl) Transition DCTL
**Trasition DCTLを使用したい場合**
> This function performs a blend from one clip (the 'From' clip : the clip fading out) to another (the 'To' clip : the clip fading in) over time. この関数では、`From clip`から`To clip`にフェードアウト、フェードインするように変化する。
```
_DEVICE__ float4 transition(int p_Width, int p_Height, int p_X, int p_Y, __TEXTURE__ p_FromTexR, __TEXTURE__ p_FromTexG, __TEXTURE__ p_FromTexB, __TEXTURE__ p_FromTexA, __TEXTURE__ p_ToTexR, __TEXTURE__ p_ToTexG,  __TEXTURE__ p_ToTexB, __TEXTURE__ p_ToTexA)

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Parameters: * p_Width and p_Height - the output image resolution. * p_X and p_Y - output pixel coordinates where the blend results are stored. * (p_FromTexR, p_FromTexG, p_FromTexB) - RGB texture references for the 'From' clip's image at TRANSITION_PROGRESS. * (p_ToTexR, p_ToTexG, p_ToTexB) - RGB texture references for the 'From' clip's image at TRANSITION_PROGRESS.
> Similar to the second transform signature, the function can access RGB values for any pixel in the "From" and "To" textures using the _tex2D([textureVariable], [posX], [posY]) function. transform同様、From,To textureのそれぞれのR,G,B,Aを`_tex2D()`に入れることでそのチャンネルのpixel valueをgetできる。
> As the transition progresses, the DCTL logic selects the appropriate image from the 'From' and 'To' clips and calls this function for each blend request. The global read-only float variable 'TRANSITION_PROGRESS', ranging from 0 (transition about to start) to 1 (transition has ended), can be used from within the function to monitor the progress of the transition. See the "Other DCTL Keywords" section.
> For Transition DCTLs, the TRANSITION_PROGRESS key holds the progress of the current transition state as a float value with range [0.0f, 1.0f]. During the transition, DaVinci Resolve updates the TRANSITION_PROGRESS value and calls the transition main entry function for each image. The DissolveTransition.dctl example illustrates how to use this key.
トランジションが進行すると、DCTLのロジックは'From clip''To clip'から適切な画像を選択し、ブレンド要求毎にこの関数を呼び出す。 グローバルな読み取り専用のfloat変数'TRANSITION_PROGRESS'が用意されていて、これは0(トランジション開始)から1(トランジション終了)の範囲で、トランジションの進行状況を監視するために関数内から使用することができます。 [0.0f, 1.0f]で変化する。
> The transition function returns a float4 (RGBA) value for each pixel at the coordinates (p_X, p_Y) for the result image.
Transitioin functionでのreturnは`float4(RGBA)`で返す。
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#including-headers) Including Headers
> You can add commonly used DCTL logic to be called in multiple effects in a header file. To include a header, add the entry:
header fileからのincludeをすることもできる。
```
#include "[pathToHeader]"

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> The path and the location of the headers are relative to the location of DCTL file. Once included, the functions in this header file can now be referenced and used after the inclusion point.
pathは相対pathで記述して、一度includeすると、その記述以降はfunctionを使うことができる。
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#define-lut%2Fapply-lut) Define LUT/Apply LUT
> Look Up Tables (LUTs) can be referenced from external files, and applied using the DEFINE_LUT and APPLY_LUT functions.
```
DEFINE_LUT([lutName], [lutPath]);

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Parameters: - [lutName] is the user-defined name of the LUT - [lutPath] is the path to the external LUT file. Both absolute paths and paths relative to the
相対path, 絶対pathでも大丈夫。`lutName`は任意に変数名的に決めて良い。
> As of DaVinci Resolve 17, LUTs can be defined inline using the DEFINE_CUBE_LUT function.
DaVinci17以降では、`DEFINE_CUBE_LUT`でinline関数的にcubeLUT formatに従ってそのままDCTLの中で宣言することができる。
```
 DEFINE_CUBE_LUT([lutName])
{
[LUT_Content]
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Parameters: - The [LUT_Content] should be wrapped with curly brackets '{}' and needs to follow the CUBE LUT standard format. - These LUTs can be applied in the same way as a referenced LUT - using the APPLY_LUT function.
`[LUT_Content]`の部分にはCUBE LUTのformatに従った形で記述していればok applyLUTの方法は、Define LUTと変わらず、APPLY_LUT()から行ける。
```
APPLY_LUT(r, g, b, [lutName]);

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Parameters: - (r, g, b) are LUT coordinates - [lutName] is the user-defined LUT name - this must match a prior DEFINE_LUT or DEFINE_CUBE_LUT call (see below).
`r,g,b`には、LUTを適用させたい元のrgb座標を入れる。`lutName`にはDEFINE_LUTで指定したlutNameを指定すること。
> The following rules apply: - LUTs must be defined in the DCTL file before use. - Multiple LUTs can be defined and applied in a single DCTL. - Multiple CUBE LUTs can be defined in a DCTL file and can be placed before or after the DCTL's Main Entry function. - LUT files must be in .cube format, with 1D or 3D LUTs, with/without shaper LUTs. - 1D LUT/Shaper LUTs will be applied with LINEAR interpolation method. - 3D LUTs will be applied with TRILINEAR or TETRAHEDRAL interpolation, as set in Resolve with [ Project Settings > Color Management > 3D Lookup Table Interpolation ].
LUTのdefineはapplyで使う前にDCTLの中でdefineすること。 `DEFINE_CUBE_LUT(){}`に関しては、DCTLのどこかで定義されていればok。main entry functionよりも後でもok LUTの補完は、1DLUT/Shpaer LUTに関してはLinear interpolationで処理される。3D Lutsに関してはTRAILINEAR, THTRAHEDRALのどちらかで処理される。それはdavinciのproject settingsの設定に引っ張られる。
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#resolve_ver_***) RESOLVE_VER_***
> **RESOLVE_VER_MAJOR** and **RESOLVE_VER_MINOR** keys hold version values for checking and guarding version specific DCTL logic.
davinciのバージョンによっての挙動を制御できるように、versionでif文などを引っ掛けれる。
```
Example: For Resolve 17.0, __RESOLVE_VER_MAJOR__ = 17 and __RESOLVE_VER_MINOR__ = 0.
  #ifdef ((__RESOLVE_VER_MAJOR__ >= 17) && (__RESOLVE_VER_MINOR__ >= 0))
 CallResolve17SpecificLogic();
  #else
 CallAlternativeLogic();
  #endif

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#device_is_***) DEVICE_IS_***
> DEVICE_IS_CUDA, DEVICE_IS_OPENCL, DEVICE_IS_METAL keys are defined for users to check and execute code conditionally in CUDA, OpenCL and Metal environments respectively.
DaVinci versionと同様に、CUDA, OPENCL, METALなどで挙動の変更ができるようにもできる。
```
  #ifdef DEVICE_IS_CUDA
 DoSomethingCUDASpecific();
  #endif

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#custom-ui) Custom UI
> Custom DCTL effects (of the Transform DCTL type) can be added as plugins from Edit Page and Color Page effects libraries. To access them, double click or drag this plugin entry: - Edit page > Effects Library > OpenFX > Filters > ResolveFX Color > DCTL. - Color page > OpenFX > ResolveFX Color > DCTL. Once added, click the DCTL List combo box and select the desired DCTL effect to apply the effect.
> To add new DCTL effects to this list, place the appropriate DCTL file in the DaVinci Resolve LUT directory. To edit a loaded DCTL effect, - navigate to the DaVinci Resolve LUT directory in a file browser. - load the appropriate DCTL file in a text editor to make changes. - Save the file. - In DaVinci Resolve's inspector, press "Reload DCTL" button to see the reflected result instantly. Each DCTL plugin can have up to 64 UI controls for each type.
LUTとして当てるのではなく、effectとして当てる場合のtransform DCTLはUIを作ることができる。 DCTLでは5つのUIが定義できる。それぞれのUIはそれぞれ64個まで使える。
```
Float Slider: DEFINE_UI_PARAMS([variable name], [label], DCTLUI_SLIDER_FLOAT, [default value], [min value], [max value], [step])
Int Slider: DEFINE_UI_PARAMS([variable name], [label], DCTLUI_SLIDER_INT, [default value], [min value], [max value], [step])
Value Box: DEFINE_UI_PARAMS([variable name], [label], DCTLUI_VALUE_BOX, [default value])
Check Box: DEFINE_UI_PARAMS([variable name], [label], DCTLUI_CHECK_BOX, [default value])
Combo Box: DEFINE_UI_PARAMS([variable name], [label], DCTLUI_COMBO_BOX, [default value], [enum list], [enum label list])

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Parameters: - The [variable name] is linked with the UI element. This variable can be used inside the transform function. - The [label] text appears alongside the control and describes the control to the user of the DCTL. - The third parameter - the ui element enum - allows DaVinci Resolve to construct the appropriate UI control. - The [default value], [min value], [max value] and [step] are int-based (except for the Float Slider, where they are float) - The [enum list] - defined in curly brackets "{}" is available for use in the Main Entry function. - The [enum label list] - defined as string inside curly brackets "{}" is used to indicate the enum value in the UI. It must contain the same number of items as [enum list].
`variable name`にUIを変化させた時に値が格納される変数を新しく作るための変数名の指定 `label`にはUIとして表示するUI名 `3番目の引数`には、UIの種類を定義しているenumの名前 `enum list`はCOMBO_BOXを選んだ時にできる引数で、`{}`で配列のようにenumを定義して、main etrry fucntionの中で使用することができる。 `enum label list`も`{}`で配列のように定義できて、UI上で表示される文字列の定義。数はenum listと一緒でないといけない。
```
DEFINE_UI_PARAMS(gainR, Red Gain, DCTLUI_SLIDER_FLOAT, 1.0, 0.0, 10.0, 0.1)
DEFINE_UI_PARAMS(iters, Iteration, DCTLUI_SLIDER_INT, 1, 0, 10, 1)
DEFINE_UI_PARAMS(gain, Master Gain, DCTLUI_VALUE_BOX, 2.0)
DEFINE_UI_PARAMS(apply, Apply, DCTLUI_CHECK_BOX, 1)
DEFINE_UI_PARAMS(opt, Channel Option, DCTLUI_COMBO_BOX, 1, { RED, GREEN, BLUE }, { Channel Red, Channel Green, Channel Blue })

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
main entry functionよりも前に定義してあげる。 そのときのvariable nameはどこかで定義した変数というわけではなく、新しくこのUIの宣言と同時に作られる変数名を指定する。
以下のような感じ。
```
DEFINE_UI_PARAMS(gainR, Red Gain, DCTLUI_SLIDER_FLOAT, 2.0, 0.0, 10.0, 0.1)
DEFINE_UI_PARAMS(gainG, Green Gain, DCTLUI_SLIDER_FLOAT, 2.0, 0.0, 10.0, 0.1)
DEFINE_UI_PARAMS(gainB, Blue Gain, DCTLUI_SLIDER_FLOAT, 2.0, 0.0, 10.0, 0.1)
DEFINE_UI_PARAMS(apply, Apply, DCTLUI_CHECK_BOX, 1)
DEFINE_UI_PARAMS(opt, Channel Option, DCTLUI_COMBO_BOX, 1, { ALL, RED, GREEN, BLUE }, { All Channels, Channel Red, Channel Green, Channel Blue })
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
{
  if (apply)
  {
 p_R = p_R * (((opt == ALL) || (opt == RED))  ? gainR : 1.0f);
 p_G = p_G * (((opt == ALL) || (opt == GREEN)) ? gainG : 1.0f);
 p_B = p_B * (((opt == ALL) || (opt == BLUE)) ? gainB : 1.0f);
  }
  return make_float3(p_R, p_G, p_B);
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#comment) comment
`//`でコメントを書くことができる。 cと同じ。
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#aces-dctl-syntax) ACES DCTL syntax
> ACES DCTLs allows user to define: - a standard color encoding (SMPTE ST 2065-1), - Input Transforms to convert different image sources to ACES, - Output Transforms in order to view ACES images on different types of displays. and use them to define the project's color science, or in Resolve FX ACES Transform for individual clips.
ACES DCTLは、以下の定義が可能： - 標準カラーエンコーディング、ACES AP0（ACES 2065-1） - 異なる画像ソースをACESに変換するためのinput Transform - 異なるタイプのディスプレイでACES画像を表示するためのoutput Transform。 また、プロジェクトのカラーサイエンスを定義したり、Resolve FXで個々のクリップのACESトランスフォームを定義するために使用することもできる。
> There are 2 types of ACES DCTL: - parametric ACES transforms - non-parametric ACES transforms (supported since DaVinci Resolve 17).
ACES DCTLでは2つのtypeが存在する。
  * parametric ACES transform
  * non-parametric ACES transform(Davinci version17から)

> 1. Adding a Custom ACES IDT or ODT File:
> 

> * Navigate to the "ACES Transforms" folder in Resolve's main application support folder. - MacOS: "~/Library/Application Support/Blackmagic Design/DaVinci Resolve/ACES Transforms" - Windows: "%AppData%\Blackmagic Design\DaVinci Resolve\Support\ACES Transforms" - Linux: "~/.local/share/DaVinciResolve/ACES Transforms"
> * Place your custom ACES DCTL files for Input Device Transforms (IDTs) in the IDT subfolder.
> * Place your custom ACES DCTL files for Output Device Transforms (ODTs) in the ODT subfolder.
> * Start Resolve.
> 

ACES DCTLで作った、IDT, ODTのfileの追加の仕方は、以下のpathに追加 `~/Library/Application Support/Blackmagic Design/DaVinci Resolve/ACES Transforms`のIDT or ODTのsubfolderに追加。
!
LUTが存在している、`/Library`ではなくて、`~/Library`なことに注意
> Applying ACES transforms from Project Settings: - Color Science: select "ACEScc" or "ACEScct" - ACES Version: select ACES version 1.1 or above. - ACES Input Device Transform: select the required ACES DCTL IDT. - ACES Output Device Transform: select the required ACES DCTL ODT.
DaVinciのProject settings Color sceinceを ACEScc or Acescctに ACESVersionは1.1以上に IDT and ODTはACES DCTLを選択することでapplyできる。
> Applying ACES Transform plugins to individual clips: - Double click or drag this plugin entry: - Edit page > Effects Library > OpenFX > Filters > ResolveFX Color > ACES Transform. - Color page > OpenFX > ResolveFX Color > ACES Transform. - Once added, select the required ACES DCTLs from the Input Transform or Output Transform combo box.
個別のclipに適用させたい場合はeffects > ACEST TRansformを適用させて、ACES DCTLのIDT or ODTを選択すれば良い。
以下のようにproject settingsとかに作成したIDTなどが表示されるようになる。 ![](https://storage.googleapis.com/zenn-user-upload/75bad0fe8ad0-20240104.png)
```
DEFINE_ACES_PARAM([Keys]: [Values])
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
{
	const float3 result = [processing expression or function];
	return result
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Depending on its location, an ACES DCTL is interpreted as an IDT or an ODT. So the DEFINE_ACES_PARAM expands its parameters into either - float3 AcesInvOutputTransform(float p_R, float p_G, float p_B); // if the DCTL is an IDT - float3 AcesOutputTransform(float p_R, float p_G, float p_B); // if the DCTL is an ODT. These functions can be called from the transform main entry function.
ACES DCTLはその位置によってIDTやODTとして解釈される。 そのため、`DEFINE_ACES_PARAM()`を次のいずれかに展開する。 DCTLがIDTの場合 `float3 AcesInvOutputTransform(float p_R, float p_G, float p_B);`
DCTLがODTの場合 `float3 AcesOutputTransform(float p_R, float p_G, float p_B);`
> ACES DCTLs are written as transform DCTLs in one of three ways - using: - a non-parametric approach and hand-rolling your own transform functions. - a parametric ACES transform definition with standard ACES EOTFs. - a parametric ACES transform definition with custom EOTF functions. Example files for all three scenarios are available in the ACES Transform folder in the DCTL Developer documentation.
ACES DCTLのtransform DCTLを書くにはは3つのパターンがある。
  * non-parametericアプローチ かつ、自前のTransform functionの手打ち。
  * parametric ACES transform defintion with Standard ACES EOTFs
  * parametric ACES transform definition with custom EOTF functions

##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#non-parametric-aces-transform) Non-Parametric ACES transform
> To define a Non-Parametric ACES transform (e.g. an IDT for new vendor camera, or an ODT for custom output screen), use the argument "IS_PARAMETRIC_ACES_TRANSFORM: 0". Example: DEFINE_ACES_PARAM(IS_PARAMETRIC_ACES_TRANSFORM: 0)
Non-Parametric ACES transform(例として、新しいカメラのIDTやカスタム output screenなど)を定義するには、`DEFINE_ACES_PARAM`の引数を`IS_PARAMETRIC_ACES_TRANSFORM: 0`にする。
```
DEFINE_ACES_PARAM(IS_PARAMETRIC_ACES_TRANSFORM: 0)

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
> Once defined as non-parametric, all other parameter definitions in DEFINE_ACES_PARAM are ignored.
> 1. The user then defines either: - a custom IDT to convert the image source to the AP0 Linear colorspace, or - a custom ODT to convert incoming data from the AP0 linear colorspace.
> 2. invokes it from the main transform function.
> 

一旦 non-parametricとして定義されたら、他の全ての`DEFINE_ACES_PARAMS`パラメーターは無視される。 そして、ユーザーは次のいずれかを定義しないといけない。
  * Image SorceをAP0Linear colorspaceに変換するカスタムIDT
  * AP0 Linear colorspaceからの入力データを変換するカスタムODT メイン関数からそれらのtransform functionを呼び出す。

> Optional fields:
> * OUTPUT_COLORSPACE_TAG: Users can tag the output colorspace for ACES DCTL ODT file so that Resolve can set the display correspondingly and tag rendered media correctly. String to represent the name of tag. Tag naming is defined by extracting from Academy's odt transform official ctl "[ODT/RRTODT].Academy.[TransformName].ctl" <https://github.com/ampas/aces-dev/tree/master/transforms/ctl/odt> <https://github.com/ampas/aces-dev/tree/master/transforms/ctl/outputTransform> e.g. "ODT.Academy.Rec2020_P3D65limited_100nits_dim.ctl" - corresponding OutputColorSpaceTag name is "Rec2020_P3D65limited_100nits_dim" By default, if this tag is not present the output colorspace is assumed to be Rec 709, Gamma 2.4.
> 

ユーザーはACES DCTL ODT fileに対してoutput colorspaceのtagをつけることができる。そうすると、Resolve側がrenderやdisplayを正しく対応することができる。 ネーミングはAcademyの方で定義しているofficial ctlと同じ `"[ODT/RRTODT].Academy.[TransformName].ctl"` 例えば、以下のようにすると、 `OUTPUT_COLORSPACE_TAG : "ODT.Academy.Rec2020_P3D65limited_100nits_dim.ctl"` Rec2020_P3D65limited_100nits_dimとしてOutputColorspacaetagが認識する。 デフォルトでは、このタグがない場合は、Rec709 2.4として認識される。
<https://github.com/ampas/aces-dev/tree/master/transforms/ctl/odt>
<https://github.com/ampas/aces-dev/tree/master/transforms/ctl/outputTransform>
example
IDT_Custom_sRGB.dctl
```
DEFINE_ACES_PARAM(IS_PARAMETRIC_ACES_TRANSFORM: 0)
//------------- Custom sRGB (Texture) IDT -------------//
//
// Converts sRGB to ACES data with no RRT or tone mapping.
//
// Input: sRGB
// Output: ACES AP0/Linear
__DEVICE__ inline float sRGBDecodeGamma(float p_Input)
{
  const float cLinear = 0.04045f;
  const float offset = 0.055f;
  const float slope = 12.92f;
  const float gamma = 2.4f;
  return ((p_Input <= cLinear) ? (p_Input / slope) : (_powf(((p_Input + offset) / (1.0f + offset)), gamma)));
}
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
{
  const float r = sRGBDecodeGamma(p_R);
  const float g = sRGBDecodeGamma(p_G);
  const float b = sRGBDecodeGamma(p_B);
  // sRGB to AP0
  const float rt = (0.435410f * r) + (0.369344f * g) + (0.192186f * b);
  const float gt = (0.086569f * r) + (0.814826f * g) + (0.090110f * b);
  const float bt = (0.022413f * r) + (0.110703f * g) + (0.873335f * b);
  return make_float3(rt ,gt, bt);
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
ODT_Custom_sRGB.dctl
```
DEFINE_ACES_PARAM(IS_PARAMETRIC_ACES_TRANSFORM: 0)
//------------- Custom sRGB (Texture) ODT -------------//
//
// Converts ACES to sRGB data with no RRT or tone mapping.
//
// Input: ACES AP0/Linear
// Output: sRGB
__DEVICE__ inline float sRGBEncodeGamma(float p_Val)
{
  const float cLinear = 0.0031308f;
  const float offset = 0.055f;
  const float slope = 12.92f;
  const float inverseGamma = 1.0f / 2.4f;
  return ((p_Val <= cLinear) ? (slope * p_Val) : ((1.0f + offset) * _powf(p_Val, inverseGamma) - offset));
}
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
{
  // AP0 to sRGB
  float rt = ( 2.536153f * p_R) + (-1.089029f * p_G) + (-0.445740f * p_B);
  float gt = (-0.265976f * p_R) + ( 1.358915f * p_G) + (-0.081682f * p_B);
  float bt = (-0.031371f * p_R) + (-0.144307f * p_G) + ( 1.166828f * p_B);
  rt = sRGBEncodeGamma(rt);
  gt = sRGBEncodeGamma(gt);
  bt = sRGBEncodeGamma(bt);
  return make_float3(rt ,gt, bt);
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#parametric-aces-transform) Parametric ACES Transform
> Parametric ACES transforms are supported under ACES version 1.1 or above. To write a parametric ACES transform following this standard, you need to define the following fields: - Y_MIN: black luminance (cd/m^2) - float. - Y_MID: mid-point luminance (cd/m^2) - float. - Y_MAX: peak white luminance (cd/m^2) - float. - DISPLAY_PRI: Display primaries - array of 8 floats inside curly brackets "{}". - LIMITING_PRI: Limiting primaries - array of 8 floats inside curly brackets "{}". - EOTF: Display device EOTF - integer in range [0-5] (see below) - INVERSE_EOTF: Input device EOTF - integer in range [0-5] (see below) - SURROUND: Viewing environment - integer (either 0,1) representing a boolean flag - STRETCH_BLACK: Stretch black luminance to a PQ code value of 0 - integer (either 0,1) representing a boolean flag - D60_SIM: Is user D60 adapted - integer (either 0,1) representing a boolean flag - LEGAL_RANGE: Output to legal range - integer (either 0,1) representing a boolean flag
Parametric ACES trasformはversion1.1以上からサポートしている。 `DEFINE_ACES_PARAM()`の引数に以下のようなfieldを列挙させる。
  * Y_MIN: black luminance (cd/m^2) - float.
  * Y_MID: mid-point luminance (cd/m^2) - float.
  * Y_MAX: peak white luminance (cd/m^2) - float.
  * DISPLAY_PRI: Display primaries - array of 8 floats inside curly brackets "{}".
  * LIMITING_PRI: Limiting primaries - array of 8 floats inside curly brackets "{}".
  * EOTF: Display device EOTF - integer in range [0-5] (see below)
  * INVERSE_EOTF: Input device EOTF - integer in range [0-5] (see below)
  * SURROUND: Viewing environment - integer (either 0,1) representing a boolean flag
  * STRETCH_BLACK: Stretch black luminance to a PQ code value of 0 - integer (either 0,1) representing a boolean flag
  * D60_SIM: Is user D60 adapted - integer (either 0,1) representing a boolean flag
  * LEGAL_RANGE: Output to legal range - integer (either 0,1) representing a boolean flag

> Optional fields:
> * SKIP_STANDARD_ACES_RRT: Users can choose to run or skip standard ACES RRT (in output transform) or InvRRT (in input transform), and use their own custom RRT implementation. Integer (either 0,1) representing a boolean flag. By default, this value is treated as 0 and the standard ACES RRT (or InvRRT) is always used.
> * OUTPUT_COLORSPACE_TAG: Users can tag the output colorspace for ACES DCTL ODT file so that Resolve can set the display correspondingly and tag rendered media correctly. String to represent the name of tag. Tag naming is defined by extracting from Academy's odt transform official ctl "[ODT/RRTODT].Academy.[TransformName].ctl" <https://github.com/ampas/aces-dev/tree/master/transforms/ctl/odt> <https://github.com/ampas/aces-dev/tree/master/transforms/ctl/outputTransform> e.g. "ODT.Academy.Rec2020_P3D65limited_100nits_dim.ctl" - corresponding OutputColorSpaceTag name is "Rec2020_P3D65limited_100nits_dim" By default, if this tag is not present the output colorspace is assumed to be Rec 709, Gamma 2.4.
> 

optional fieldsとして以下の二つの追加もできる。
  * `SKIP_STANDARD_ACES_RRT : ` ユーザーは、標準 ACES RRT (output transform) または InvRRT (Input transform) の実行または省略を選択して、独自のカスタム RRT 実装を使用できる。 0 or 1でbooleanで表す。 デフォルトでは0になっていて、ACES RRT(or InvRRT)が使用されるようになっている。

#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#function) function
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#math-function-\(int\)) math function (int)
```
int abs(int x) # Returns the absolute value of x
int min(int x, int y) # Returns x or y, whichever is smaller
int max(int x, int y) # Returns x or y, whichever is larger

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#math-function-\(float\)) math function (float)
```
float _fabs(float x) # Returns the absolute value of x
float _powf(float x, float y) # Computes x raised to the power of y
float _logf(float x) # Computes the value of the natural logarithm of x
float _log2f(float x) # Computes the value of the logarithm of x to base 2
float _log10f(float x) # Computes the value of the logarithm of x to base 10
float _expf(float x) # Computes e**x, the base-e exponential of x
float _exp2f(float x) # Computes 2**x, the base-2 exponential of x
float _exp10f(float x) # Computes 10**x, the base-10 exponential of x
float _copysignf(float x, float y) # Returns x with its sign changed to y's
float _fmaxf(float x, float y) # Returns x or y, whichever is larger
float _fminf(float x, float y) # Returns x or y, whichever is smaller
float _clampf(float x, float min, float max) # Clamps x to be within the interval [min, max]
float _saturatef(float x) # Clamps x to be within the interval [0.0f, 1.0f]
float _sqrtf(float x) # Computes the non-negative square root of x
float _ceilf(float x) # Returns the smallest integral value greater than or equal to x
float _floorf(float x) # Returns the largest integral value less than or equal to x
float _truncf(float x) # Returns the integral value nearest to but no larger in magnitude than x
float _round(float x) # Returns the integral value nearest to x rounding, with half-way cases rounded away from zero
float _fmod(float x, float y) # Computes the floating-point remainder of x/y
float _hypotf(float x, float y) # Computes the square root of the sum of squares of x and y
float _cosf(float x) # Computes the cosine of x (measured in radians)
float _sinf(float x) # Computes the sine of x (measured in radians)
float _cospif(float x) # Computes the cosine of (x * pi) (measured in radians)
float _sinpif(float x) # Computes the sine of (x * pi) (measured in radians)
float _tanf(float x) # Computes the tangent of x (measured in radians)
float _acosf(float x) # Computes the principle value of the arc cosine of x
float _asinf(float x) # Computes the principle value of the arc sine of x
float _atan2f(float y, float x) # Computes the principal value of the arc tangent of y/x, using the signs of both arguments to determine the quadrant of the return value
float _acoshf(float x) # Computes the principle value of the inverse hyperbolic cosine of x
float _asinhf(float x) # Computes the principle value of the inverse hyperbolic sine of x
float _atanhf(float x) # Computes the inverse hyperbolic tangent of x
float _coshf(float x) # Computes the hyperbolic cosine of x
float _sinhf(float x) # Computes the hyperbolic sine of x
float _tanhf(float x) # Computes the hyperbolic tangent of x
float _fdimf(float x, float y) # Returns the positive difference between x and y: x - y if x > y, +0 if x is less than or equal to y
float _fmaf(float x, float y, float z) # Computes (x * y) + z as a single operation
float _rsqrtf(float x) # Computes the reciprocal of square root of x
float _fdivide(float x, float y) # Returns x/y
float _frecip(float x) # Returns 1/x
int isinf(float x) # Returns a non-zero value if and only if x is an infinite value
int isnan(float x) # Returns a non-zero value if and only if x is a NaN value
int signbit(float x) # Returns a non-zero value if and only if sign bit of x is set
T _mix(T x, T y, float a) # T is used to indicate that the function can take float, float2, float3, float4, as the type for the arguments.
 # Returns: (x + (y - x) * a). "a" must be a value in the range [0.0f, 1.0f]. If not, the return values are undefined.
float _frexp(float x, int exp) # Extracts mantissa and exponent from x. The mantissa m returned is a float with magnitude in the interval [1/2, 1) or 0,
 # and exp is updated with integer exponent value, whereas x = m * 2^exp
float _ldexp(float x, int exp) # Returns (x * 2^exp)
Note that float values must have 'f' character at the end (e.g. 1.2f).

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
##  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#texture-1) texture
###  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#_tex2d\(%5Btexturevariable%5D%2C-%5Bposx%5D%2C-%5Bposy%5D\)) _tex2D([textureVariable], [posX], [posY])
texture変数から任意のピクセルの値を呼び出すことができる。
!
GLSLと雰囲気が違うのは、texture変数はR,G,B,Aのそれぞれ単体のtexture変数になっていてるため、returnはvectorでRGBAではなく、floatで任意のチェンネルが返ってくる。
returnはfloat textureVariable : textureの変数 posX : texture coordinateのX座標 posY : texture coordinateのY座標 ``
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#global) global
> The DCTL programming environment also allows read-only access to multiple global constants. These are described in context in the sections below.
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#log) log
> 以下のフォルダにある davinci_resolve.log を見ると Syntax Error の内容が確認できる Windows: C:\Users<user_name>\AppData\Roaming\Blackmagic Design\DaVinci Resolve\Support\logs macOS: /Users/<user_name>/Library/Appli˝cation Support/Blackmagic Design/DaVinci Resolve/logs エラーログの例は以下
<https://trev16.hatenablog.com/entry/2023/05/20/001433>
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#timeline-colorspace-and-input-output-range) timeline colorspace and input output Range
![](https://storage.googleapis.com/zenn-user-upload/e1dd7f85abfc-20240423.png) _<https://trev16.hatenablog.com/entry/2023/05/20/001433>_
#  [](https://zenn.dev/omakazu/articles/0d63566ebea6d3#pipeline) pipeline
DCTLは1node内では、どうやらcolor pageの他のものよりも一番後 3DLUTと同じタイミングで処理されるらしい。 つまり、color wheelなどを動かした後に、DCTLにinしてくる。
```
__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
{
  float r = 0.0f;
  float g = 0.0f;
  float b = 1.0f;
  if(p_R-0.001 <= p_G <= p_G+0.001){
 r = 0.0f;
 g = 0.0f;
 b = 1.0f;
  
  }
  else{
 r = 1.0f;
 g = 0.0f;
 b = 0.0f;
  }

  return make_float3(r, g, b);
}

```
![](https://static.zenn.studio/images/copy-icon.svg)![](https://static.zenn.studio/images/wrap-icon.svg)
2
[](https://twitter.com/intent/tweet?url=https://zenn.dev/omakazu/articles/0d63566ebea6d3&text=DCTL%20syntax%20memo%EF%BD%9Comakazu&hashtags=zenn)[](http://www.facebook.com/sharer.php?u=https://zenn.dev/omakazu/articles/0d63566ebea6d3)[](https://b.hatena.ne.jp/add?mode=confirm&url=https://zenn.dev/omakazu/articles/0d63566ebea6d3&title=DCTL%20syntax%20memo%EF%BD%9Comakazu)

[omakazu](https://zenn.dev/omakazu)
映像表現 / 写真表現 
[](https://x.com/kazuomasu1913)
バッジを贈って著者を応援しよう
バッジを受け取った著者にはZennから現金やAmazonギフトカードが還元されます。
バッジを贈る
### Discussion
![](https://static.zenn.studio/images/drawing/discussion.png)

[omakazu](https://zenn.dev/omakazu)
[](https://x.com/kazuomasu1913)
映像表現 / 写真表現 
バッジを贈る
[バッジを贈るとは](https://zenn.dev/faq#badges)
目次
  1. [DCTL type](https://zenn.dev/omakazu/articles/0d63566ebea6d3#dctl-type)
 1. [enum](https://zenn.dev/omakazu/articles/0d63566ebea6d3#enum)
 2. [TEXTURE](https://zenn.dev/omakazu/articles/0d63566ebea6d3#texture)
 3. [float2, float3, float4](https://zenn.dev/omakazu/articles/0d63566ebea6d3#float2%2C-float3%2C-float4)
 4. [修飾子(qualifier)](https://zenn.dev/omakazu/articles/0d63566ebea6d3#%E4%BF%AE%E9%A3%BE%E5%AD%90\(qualifier\))
 5. [typedef struct](https://zenn.dev/omakazu/articles/0d63566ebea6d3#typedef-struct)
  2. [Syntax](https://zenn.dev/omakazu/articles/0d63566ebea6d3#syntax)
 1. [Transform DCTL](https://zenn.dev/omakazu/articles/0d63566ebea6d3#transform-dctl)
 2. [Transition DCTL](https://zenn.dev/omakazu/articles/0d63566ebea6d3#transition-dctl)
 3. [Including Headers](https://zenn.dev/omakazu/articles/0d63566ebea6d3#including-headers)
 4. [Define LUT/Apply LUT](https://zenn.dev/omakazu/articles/0d63566ebea6d3#define-lut%2Fapply-lut)
 5. [RESOLVE_VER_***](https://zenn.dev/omakazu/articles/0d63566ebea6d3#resolve_ver_***)
 6. [DEVICE_IS_***](https://zenn.dev/omakazu/articles/0d63566ebea6d3#device_is_***)
 7. [Custom UI](https://zenn.dev/omakazu/articles/0d63566ebea6d3#custom-ui)
 8. [comment](https://zenn.dev/omakazu/articles/0d63566ebea6d3#comment)
  3. [ACES DCTL syntax](https://zenn.dev/omakazu/articles/0d63566ebea6d3#aces-dctl-syntax)
 1. [Non-Parametric ACES transform](https://zenn.dev/omakazu/articles/0d63566ebea6d3#non-parametric-aces-transform)
 2. [Parametric ACES Transform](https://zenn.dev/omakazu/articles/0d63566ebea6d3#parametric-aces-transform)
  4. [function](https://zenn.dev/omakazu/articles/0d63566ebea6d3#function)
 1. [math function (int)](https://zenn.dev/omakazu/articles/0d63566ebea6d3#math-function-\(int\))
 2. [math function (float)](https://zenn.dev/omakazu/articles/0d63566ebea6d3#math-function-\(float\))
 3. [texture](https://zenn.dev/omakazu/articles/0d63566ebea6d3#texture-1)
  5. [global](https://zenn.dev/omakazu/articles/0d63566ebea6d3#global)
  6. [log](https://zenn.dev/omakazu/articles/0d63566ebea6d3#log)
  7. [timeline colorspace and input output Range](https://zenn.dev/omakazu/articles/0d63566ebea6d3#timeline-colorspace-and-input-output-range)
  8. [pipeline](https://zenn.dev/omakazu/articles/0d63566ebea6d3#pipeline)

Zennからのお知らせ

2
[Zenn](https://zenn.dev/)
エンジニアのための情報共有コミュニティ
#### About
  * [Zennについて](https://zenn.dev/about)
  * [運営会社](https://classmethod.jp)
  * [お知らせ・リリース](https://info.zenn.dev)
  * [イベント](https://zenn.dev/events)

#### Guides
  * [使い方](https://zenn.dev/manual)
  * [法人向けメニュー](https://zenn.dev/biz-lp)New
  * [Publication / Pro](https://zenn.dev/publications)
  * [よくある質問](https://zenn.dev/faq)

#### Links
  * [X(Twitter)](https://twitter.com/zenn_dev)
  * [GitHub](https://github.com/zenn-dev)
  * [メディアキット](https://zenn.dev/mediakit)

#### Legal
  * [利用規約](https://zenn.dev/terms)
  * [プライバシーポリシー](https://zenn.dev/privacy)
  * [特商法表記](https://zenn.dev/terms/transaction-law)

[](https://classmethod.jp/)

---

## 2. Zenn

**URL:** https://zenn.dev/

[Zenn](https://zenn.dev/)
[Trending](https://zenn.dev/)[Explore](https://zenn.dev/articles/explore)

ハッカソン
## [第２回 AI Agent Hackathon with Google Cloud](https://zenn.dev/hackathons/google-cloud-japan-ai-hackathon-vol2)
期間: 2025/04/13 ~ 2025/06/30

ミートアップ
## [Zenncafe日比谷#3 TypeScriptとチーム開発](https://zenn.connpass.com/event/357434/)
開催日: 2025/07/14 11:30 ~ 14:00
### Tech
？
[📖](https://zenn.dev/sesere/articles/4c0b55102dcc84)
## [Claude Codeとplaywright mcpを連携させると開発体験が向上するのでみんなやろう](https://zenn.dev/sesere/articles/4c0b55102dcc84)

[sesere](https://zenn.dev/sesere)
19時間前 121
[🐷](https://zenn.dev/ks0318/articles/0779b38a023896)
## [Claude Codeの前と後。やり始めたこととやめたこと](https://zenn.dev/ks0318/articles/0779b38a023896)

[しば田](https://zenn.dev/ks0318)
1日前 175
[🤑](https://zenn.dev/ideagarage/articles/a2f5a4f04d7dcb)
## [個人開発者のためのStripe超入門①](https://zenn.dev/ideagarage/articles/a2f5a4f04d7dcb)

[アイデアガレージ](https://zenn.dev/ideagarage)
2日前 152
[📱](https://zenn.dev/itome/articles/f8f1d6ff662a92)
## [Claude Code時代のアプリ開発手法](https://zenn.dev/itome/articles/f8f1d6ff662a92)

[Takeshi Tsukamoto](https://zenn.dev/itome)
2日前 120
[📝](https://zenn.dev/ml_bear/articles/84e92429698177)
## [Claude Code 逆引きコマンド事典](https://zenn.dev/ml_bear/articles/84e92429698177)

[ML_Bear](https://zenn.dev/ml_bear)
2日前 228
[👋](https://zenn.dev/dinii/articles/e615ae7d517795)
## [🧹.env にさよなら！全てのサービス開発者が実感するビルドプロセス改善🔐⏱️⚙️](https://zenn.dev/dinii/articles/e615ae7d517795)

[0tany41](https://zenn.dev/0tany41)in[Dinii Tech Blog](https://zenn.dev/p/dinii)
1日前 108
[🌳](https://zenn.dev/uhyo/articles/biome-v2-type-inference)
## [Biome v2の型推論を試して限界を知る](https://zenn.dev/uhyo/articles/biome-v2-type-inference)

[uhyo](https://zenn.dev/uhyo)
2日前 96
[🦜](https://zenn.dev/parakeet_tech/articles/2591e71094ea58)
## [日本語TTS用の学習データの精度を上げる「ふりがなWhisper」を作った話](https://zenn.dev/parakeet_tech/articles/2591e71094ea58)

[H. Enomoto](https://zenn.dev/henomoto)in[Parakeet 株式会社](https://zenn.dev/p/parakeet_tech)
2日前 53
[🍤](https://zenn.dev/ncdc/articles/26165a6fedd7e4)
## [MCPサーバーを使うなら Prompt Caching が大切だと思い知った話](https://zenn.dev/ncdc/articles/26165a6fedd7e4)

[いばらき](https://zenn.dev/ibaraki)in[NCDCエンジニアブログ](https://zenn.dev/p/ncdc)
2日前 54
[🥳](https://zenn.dev/solvio/articles/b53d24a41e6d5b)
## [個人的CLAUDE.mdのすゝめ](https://zenn.dev/solvio/articles/b53d24a41e6d5b)

[sho_](https://zenn.dev/noiron)in[Solvio株式会社](https://zenn.dev/p/solvio)
3日前 68
[📄](https://zenn.dev/chot/articles/4b484d45eae424)
## [Tanstack Query による 2 パターンのページネーション設計](https://zenn.dev/chot/articles/4b484d45eae424)

[Tsuboi](https://zenn.dev/tsuboi)in[chot Inc. tech blog](https://zenn.dev/p/chot)
2日前 34
[💰](https://zenn.dev/nakakiiro/articles/make_ccusage_vscode_plugin)
## [【Claude Code】ccusageの料金情報をVSCodeステータスバーに表示するプラグインを1時間で作ってみた](https://zenn.dev/nakakiiro/articles/make_ccusage_vscode_plugin)

[nakakiiro](https://zenn.dev/nakakiiro)
2日前 26
[🎲](https://zenn.dev/nanasi_1/articles/5559a60b343076)
## [【TypeScript】1%×100回=63%らしいので、コードを書いて検証してみた](https://zenn.dev/nanasi_1/articles/5559a60b343076)

[nanasi](https://zenn.dev/nanasi_1)
3日前 43
[🎯](https://zenn.dev/discus0434/articles/claude-code-python-template)
## [Claude Code中心の開発のためのPythonテンプレートの設計](https://zenn.dev/discus0434/articles/claude-code-python-template)

[動詞](https://zenn.dev/discus0434)
4日前 109
[🛡️](https://zenn.dev/saitogo/articles/88e93fdf0b1dd5)
## [Zod + Branded Typeで真の型安全へ](https://zenn.dev/saitogo/articles/88e93fdf0b1dd5)

[saitogo](https://zenn.dev/saitogo)
4日前 85
[🚀](https://zenn.dev/ichigoooo/articles/claude-code-cursor-integration)
## [【3分でできる】Claude CodeをCursorで使う方法【簡単】](https://zenn.dev/ichigoooo/articles/claude-code-cursor-integration)

[いちご](https://zenn.dev/ichigoooo)
1日前 14
[💡](https://zenn.dev/pepabo/articles/3113622c0be8d9)
## [Claude Codeのタスク完了を光で感じる](https://zenn.dev/pepabo/articles/3113622c0be8d9)

[nacal](https://zenn.dev/nacal)in[GMOペパボ株式会社](https://zenn.dev/p/pepabo)
4日前 80
[🎏](https://zenn.dev/dala/articles/claude-code-efficiency)
## [Claude Code実用する上で最低限やると良いこと](https://zenn.dev/dala/articles/claude-code-efficiency)

[だら](https://zenn.dev/dala)
3日前 25
[🧪](https://zenn.dev/kikagaku/articles/component-testing)
## [コンポーネントテストの方法4種類比較してみる（2025年版）](https://zenn.dev/kikagaku/articles/component-testing)

[かがん](https://zenn.dev/kagan)in[株式会社キカガク](https://zenn.dev/p/kikagaku)
3日前 29
[📘](https://zenn.dev/ri5255/articles/bd27666731cf08)
## [セキュリティ・キャンプ2025 ネクスト 応募課題晒し](https://zenn.dev/ri5255/articles/bd27666731cf08)

[r1ru](https://zenn.dev/ri5255)
14時間前 4
[トレンドをもっと見る→](https://zenn.dev/articles/explore)
### For youβ
？
### Ideas
？
[🌐](https://zenn.dev/yohamta/articles/25581c19b45c5f)
## [普通のエンジニアが、 4 年かけて個人開発の OSS で GitHub Star 2.3k を獲得するまでに考えたこと](https://zenn.dev/yohamta/articles/25581c19b45c5f)

[YotaHamada](https://zenn.dev/yohamta)
3日前 167
[📱](https://zenn.dev/r_kaga/articles/49369e1f5fb450)
## [そろそろスマホから開発してみませんか？移動中も開発したくないですか？](https://zenn.dev/r_kaga/articles/49369e1f5fb450)

[r.kagaya](https://zenn.dev/r_kaga)
2日前 104
[💬](https://zenn.dev/oliver/articles/discord-yatteiki-2025)
## [全人類、いますぐ Discord を使い倒そう](https://zenn.dev/oliver/articles/discord-yatteiki-2025)

[oliver](https://zenn.dev/oliver)
3日前 115
[🔎](https://zenn.dev/ryosuke_horie/articles/24768b727ff27c)
## [ClaudeのMaxプランによって変わった個人開発のスタイル](https://zenn.dev/ryosuke_horie/articles/24768b727ff27c)

[ryosuke-horie](https://zenn.dev/ryosuke_horie)
3日前 105
[🌊](https://zenn.dev/mkj/articles/b04bdede9bc3d6)
## [日本語医療特化型LLMの現状と展望](https://zenn.dev/mkj/articles/b04bdede9bc3d6)

[sha](https://zenn.dev/sha)in[松尾研究所テックブログ](https://zenn.dev/p/mkj)
2日前 36
[🧐](https://zenn.dev/hacobell_dev/articles/a-choice-of-preference)
## [それって本当に「好みの問題」？](https://zenn.dev/hacobell_dev/articles/a-choice-of-preference)

[ほりしょー](https://zenn.dev/h0r15h0)in[Hacobell Developers Blog](https://zenn.dev/p/hacobell_dev)
1日前 28
[記事をさらに探す→](https://zenn.dev/articles/explore#ideas)
### Books
¥3,600UnrealEngine5の教科書 [ゲーム開発入門編,第一巻]](https://zenn.dev/daichi_gamedev/books/unreal-engine-tutorial)
[ブックストアで本を探す→](https://zenn.dev/books/explore)
### Featured
[👾](https://zenn.dev/rockname/articles/f85e08f2a971dc)
## [Framelink Figma MCPを使用したSwiftUIのコード生成を試行錯誤する](https://zenn.dev/rockname/articles/f85e08f2a971dc)

[rockname](https://zenn.dev/rockname)
2日前 9
[🤖](https://zenn.dev/praha/articles/f4c3b59c69c680)
## [MCPサーバーでTSDocを参照出来るようにする](https://zenn.dev/praha/articles/f4c3b59c69c680)

[Karibash](https://zenn.dev/karibash)in[PrAha](https://zenn.dev/p/praha)
5日前 12
[📶](https://zenn.dev/progdence/articles/6f2ec60af8148e)
## [Cisco Catalyst 9800 & 9100におけるバージョン選定の一例](https://zenn.dev/progdence/articles/6f2ec60af8148e)

[yukitaka](https://zenn.dev/yukitaka)in[株式会社プログデンス](https://zenn.dev/p/progdence)
5日前 3
[🌊](https://zenn.dev/optimind/articles/bigquery-bucketed-insert-with-effec-ts)
## [Effect.tsはストリームを扱う目的でも便利だよ、という話 with BigQuery Storage Write API](https://zenn.dev/optimind/articles/bigquery-bucketed-insert-with-effec-ts)

[luma](https://zenn.dev/luma)in[OPTIMINDテックブログ](https://zenn.dev/p/optimind)
6日前 22
[🍞](https://zenn.dev/ncdc/articles/a0518a54684bdc)
## [Claudeの実行ログをBigQueryへ取得する ( Google Cloud / Vertex AI )](https://zenn.dev/ncdc/articles/a0518a54684bdc)

[いばらき](https://zenn.dev/ibaraki)in[NCDCエンジニアブログ](https://zenn.dev/p/ncdc)
6日前 4
[📘](https://zenn.dev/levtech/articles/adf30bc7763e33)
## [命令型プログラミング言語のPHPで、宣言的なコードを書く](https://zenn.dev/levtech/articles/adf30bc7763e33)

[くみねこ](https://zenn.dev/kkyoka)in[レバテック開発部](https://zenn.dev/p/levtech)
6日前 6
[😇](https://zenn.dev/gogen/articles/aa5c2e41b64c3f)
## [更新処理の普遍的な考えとFieldMaskによる一例](https://zenn.dev/gogen/articles/aa5c2e41b64c3f)

[s4s7](https://zenn.dev/xs4s7x)in[GOGEN Tech Blog](https://zenn.dev/p/gogen)
6日前 10
[🎆](https://zenn.dev/rktm/articles/fb6669e446d149)
## [話題の拡散言語モデルを理解しよう！](https://zenn.dev/rktm/articles/fb6669e446d149)

[Rick](https://zenn.dev/rktm)
6日前 24
[🐰](https://zenn.dev/mofuweb/articles/nextjs-typescript-guide-1-4)
## [Next.js のデバッグ実行が遅かったのを3倍速くした方法](https://zenn.dev/mofuweb/articles/nextjs-typescript-guide-1-4)

[mofuweb](https://zenn.dev/mofuweb)
7日前 8
[🧰](https://zenn.dev/socialplus/articles/fb7ac716d7470b)
## [Rails の本番作業を便利にする maintenance_tasks gem の紹介](https://zenn.dev/socialplus/articles/fb7ac716d7470b)

[otsubo](https://zenn.dev/otsuboa)in[Social PLUS Tech Blog](https://zenn.dev/p/socialplus)
7日前 13
[🛠️](https://zenn.dev/canly/articles/edd0d4d94c97a7)
## [RecoilからJotaiに移行してみた：注意点と実装Tipsまとめ](https://zenn.dev/canly/articles/edd0d4d94c97a7)

[aoyy](https://zenn.dev/amai4)in[カンリーテックブログ](https://zenn.dev/p/canly)
7日前 18
[🎨](https://zenn.dev/chooyan/articles/52c515ea03b224)
## [WidgetsApp で実現する自由なデザインの Flutter アプリ開発](https://zenn.dev/chooyan/articles/52c515ea03b224)

[中條 剛（ちゅーやん）](https://zenn.dev/chooyan)
8日前 46
[⛳](https://zenn.dev/progdence/articles/6bb7dfa5fe9638)
## [Claude Desktop で Zscaler の MCPサーバーを試す](https://zenn.dev/progdence/articles/6bb7dfa5fe9638)

[Masato Nagano](https://zenn.dev/nmasato)in[株式会社プログデンス](https://zenn.dev/p/progdence)
9日前 6
[🥷](https://zenn.dev/dinii/articles/f09d21542871ae)
## [大規模 Node.js サーバーに潜むパフォーマンス上のリスクを Event Loop から理解する](https://zenn.dev/dinii/articles/f09d21542871ae)

[whatasoda](https://zenn.dev/whatasoda)in[Dinii Tech Blog](https://zenn.dev/p/dinii)
9日前 90
[📔](https://zenn.dev/progate/articles/app-router-i18n-without-library)
## [Next.jsのApp Routerでライブラリに頼らない多言語対応](https://zenn.dev/progate/articles/app-router-i18n-without-library)

[Godai Hori](https://zenn.dev/steelydylan)in[Progate Tech Blog](https://zenn.dev/p/progate)
9日前 75
[📱](https://zenn.dev/rsakao/articles/75d6524fc9bf20)
## [外出先のiPhoneから自宅MacのClaude Codeを操作する方法｜Tailscale × NeoServer × tmux](https://zenn.dev/rsakao/articles/75d6524fc9bf20)

[ロジ](https://zenn.dev/rsakao)
10日前 19
[📚](https://zenn.dev/thdy/articles/microsoft-docs-mcp)
## [Microsoft Docs 公式 MCP サーバーを使って Microsoft のドキュメントを読みやすくする](https://zenn.dev/thdy/articles/microsoft-docs-mcp)

[thdy](https://zenn.dev/thdy)
10日前 68
[🔭](https://zenn.dev/mirko_san/articles/8198c43327d473)
## [OpenTelemetry-Go@v1.36.0 で体験する分散トレース+ログ統合入門](https://zenn.dev/mirko_san/articles/8198c43327d473)

[mirko-san](https://zenn.dev/mirko_san)
10日前 1
[Zenn](https://zenn.dev/)
エンジニアのための情報共有コミュニティ
#### About
  * [Zennについて](https://zenn.dev/about)
  * [運営会社](https://classmethod.jp)
  * [お知らせ・リリース](https://info.zenn.dev)
  * [イベント](https://zenn.dev/events)

#### Guides
  * [使い方](https://zenn.dev/manual)
  * [法人向けメニュー](https://zenn.dev/biz-lp)New
  * [Publication / Pro](https://zenn.dev/publications)
  * [よくある質問](https://zenn.dev/faq)

#### Links
  * [X(Twitter)](https://twitter.com/zenn_dev)
  * [GitHub](https://github.com/zenn-dev)
  * [メディアキット](https://zenn.dev/mediakit)

#### Legal
  * [利用規約](https://zenn.dev/terms)
  * [プライバシーポリシー](https://zenn.dev/privacy)
  * [特商法表記](https://zenn.dev/terms/transaction-law)

[](https://classmethod.jp/)

---

## 3. omakazu

**URL:** https://zenn.dev/omakazu

[Zenn](https://zenn.dev/)
![omakazu](https://storage.googleapis.com/zenn-user-upload/avatar/745b05da9a.jpeg)
# omakazu
映像表現 / 写真表現 
32Likes3Followers
[](https://x.com/kazuomasu1913)[](https://zenn.dev/omakazu/feed)
[Articles8](https://zenn.dev/omakazu)[Scraps24](https://zenn.dev/omakazu?tab=scraps)[Comments](https://zenn.dev/omakazu?tab=comments)
[Zenn](https://zenn.dev/)
エンジニアのための情報共有コミュニティ
#### About
  * [Zennについて](https://zenn.dev/about)
  * [運営会社](https://classmethod.jp)
  * [お知らせ・リリース](https://info.zenn.dev)
  * [イベント](https://zenn.dev/events)

#### Guides
  * [使い方](https://zenn.dev/manual)
  * [法人向けメニュー](https://zenn.dev/biz-lp)New
  * [Publication / Pro](https://zenn.dev/publications)
  * [よくある質問](https://zenn.dev/faq)

#### Links
  * [X(Twitter)](https://twitter.com/zenn_dev)
  * [GitHub](https://github.com/zenn-dev)
  * [メディアキット](https://zenn.dev/mediakit)

#### Legal
  * [利用規約](https://zenn.dev/terms)
  * [プライバシーポリシー](https://zenn.dev/privacy)
  * [特商法表記](https://zenn.dev/terms/transaction-law)

[](https://classmethod.jp/)

---

## 4. davinci

**URL:** https://zenn.dev/topics/davinci

[Zenn](https://zenn.dev/)
![davinci](https://zenn.dev/images/topic.png)
# davinci
このトピックを指定するには`davinci`と入力
[Articles1](https://zenn.dev/topics/davinci)[Scraps1](https://zenn.dev/topics/davinci?tab=scraps)
## articles
[Trending](https://zenn.dev/topics/davinci?order=daily)[Alltime](https://zenn.dev/topics/davinci?order=alltime)[Latest](https://zenn.dev/topics/davinci?order=latest)
[🤖](https://zenn.dev/omakazu/articles/0d63566ebea6d3)
## [DCTL syntax memo](https://zenn.dev/omakazu/articles/0d63566ebea6d3)

[omakazu](https://zenn.dev/omakazu)
2024/05/26 2
[Zenn](https://zenn.dev/)
エンジニアのための情報共有コミュニティ
#### About
  * [Zennについて](https://zenn.dev/about)
  * [運営会社](https://classmethod.jp)
  * [お知らせ・リリース](https://info.zenn.dev)
  * [イベント](https://zenn.dev/events)

#### Guides
  * [使い方](https://zenn.dev/manual)
  * [法人向けメニュー](https://zenn.dev/biz-lp)New
  * [Publication / Pro](https://zenn.dev/publications)
  * [よくある質問](https://zenn.dev/faq)

#### Links
  * [X(Twitter)](https://twitter.com/zenn_dev)
  * [GitHub](https://github.com/zenn-dev)
  * [メディアキット](https://zenn.dev/mediakit)

#### Legal
  * [利用規約](https://zenn.dev/terms)
  * [プライバシーポリシー](https://zenn.dev/privacy)
  * [特商法表記](https://zenn.dev/terms/transaction-law)

[](https://classmethod.jp/)

---

## 5. resolve

**URL:** https://zenn.dev/topics/resolve

[Zenn](https://zenn.dev/)
![resolve](https://zenn.dev/images/topic.png)
# resolve
このトピックを指定するには`resolve`と入力
[Articles2](https://zenn.dev/topics/resolve)
## articles
[Trending](https://zenn.dev/topics/resolve?order=daily)[Alltime](https://zenn.dev/topics/resolve?order=alltime)[Latest](https://zenn.dev/topics/resolve?order=latest)
[🤖](https://zenn.dev/omakazu/articles/0d63566ebea6d3)
## [DCTL syntax memo](https://zenn.dev/omakazu/articles/0d63566ebea6d3)

[omakazu](https://zenn.dev/omakazu)
2024/05/26 2
[⌨️](https://zenn.dev/uliboooo/articles/a45618e9c92b24)
## [windows11で日本語IMEを削除する方法](https://zenn.dev/uliboooo/articles/a45618e9c92b24)

[Uliboooo(うりぼう)](https://zenn.dev/uliboooo)
20日前 1
[Zenn](https://zenn.dev/)
エンジニアのための情報共有コミュニティ
#### About
  * [Zennについて](https://zenn.dev/about)
  * [運営会社](https://classmethod.jp)
  * [お知らせ・リリース](https://info.zenn.dev)
  * [イベント](https://zenn.dev/events)

#### Guides
  * [使い方](https://zenn.dev/manual)
  * [法人向けメニュー](https://zenn.dev/biz-lp)New
  * [Publication / Pro](https://zenn.dev/publications)
  * [よくある質問](https://zenn.dev/faq)

#### Links
  * [X(Twitter)](https://twitter.com/zenn_dev)
  * [GitHub](https://github.com/zenn-dev)
  * [メディアキット](https://zenn.dev/mediakit)

#### Legal
  * [利用規約](https://zenn.dev/terms)
  * [プライバシーポリシー](https://zenn.dev/privacy)
  * [特商法表記](https://zenn.dev/terms/transaction-law)

[](https://classmethod.jp/)

---

## 6. dctl

**URL:** https://zenn.dev/topics/dctl

[Zenn](https://zenn.dev/)
![dctl](https://zenn.dev/images/topic.png)
# dctl
このトピックを指定するには`dctl`と入力
[Articles1](https://zenn.dev/topics/dctl)
## articles
[Trending](https://zenn.dev/topics/dctl?order=daily)[Alltime](https://zenn.dev/topics/dctl?order=alltime)[Latest](https://zenn.dev/topics/dctl?order=latest)
[🤖](https://zenn.dev/omakazu/articles/0d63566ebea6d3)
## [DCTL syntax memo](https://zenn.dev/omakazu/articles/0d63566ebea6d3)

[omakazu](https://zenn.dev/omakazu)
2024/05/26 2
[Zenn](https://zenn.dev/)
エンジニアのための情報共有コミュニティ
#### About
  * [Zennについて](https://zenn.dev/about)
  * [運営会社](https://classmethod.jp)
  * [お知らせ・リリース](https://info.zenn.dev)
  * [イベント](https://zenn.dev/events)

#### Guides
  * [使い方](https://zenn.dev/manual)
  * [法人向けメニュー](https://zenn.dev/biz-lp)New
  * [Publication / Pro](https://zenn.dev/publications)
  * [よくある質問](https://zenn.dev/faq)

#### Links
  * [X(Twitter)](https://twitter.com/zenn_dev)
  * [GitHub](https://github.com/zenn-dev)
  * [メディアキット](https://zenn.dev/mediakit)

#### Legal
  * [利用規約](https://zenn.dev/terms)
  * [プライバシーポリシー](https://zenn.dev/privacy)
  * [特商法表記](https://zenn.dev/terms/transaction-law)

[](https://classmethod.jp/)


## 📚 Dodatkowe Zasoby

### 🔗 Powiązane Linki

- [Zenn](https://zenn.dev/)
- [Articles1](https://zenn.dev/topics/davinci)
- [Articles2](https://zenn.dev/topics/resolve)
- [Articles1](https://zenn.dev/topics/dctl)
- [tech](https://zenn.dev/tech-or-idea)
