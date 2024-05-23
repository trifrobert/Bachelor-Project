
import {Text, StyleSheet, Pressable} from 'react-native'
import React from 'react'

const CustomButton = ({
  onPress, 
  text, 
  type, 
  fgColor, 
  bgColor, 
  marginVertical, 
  marginHorizontal, 
  borderColor, 
  width,
  height
}) => {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles[`container_${type}`], 
        bgColor ? {backgroundColor: bgColor} : {backgroundColor:'black'},
        marginVertical ? {marginVertical: marginVertical} : {marginVertical:12},
        marginHorizontal ? {marginHorizontal: marginHorizontal} : {marginHorizontal: 0},
        borderColor ? {borderColor: borderColor} : {borderColor: "transparent"},
        width ? {width: width} : {width: 'auto'},
        height ? {height: height} : {height: 'auto'},
      ]}
    >
      <Text style={[styles[`text_${type}`], fgColor ? {color:fgColor} : {}]}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({

  //------------------------FIRST STYLE------------------------//
    container_PRIMARY: {
        alignItems:'center',
        justifyContent:'center',
        padding: 12,

        borderRadius: 15,
        borderWidth: 1.5, 
    },
    text_PRIMARY:{
        fontWeight: 'bold',
        fontSize: 20
    },
  //------------------------SECOND STYLE------------------------//
    container_SECONDARY:{
      alignItems:'center',
    },
    text_SECONDARY:{
        fontWeight: 'bold',
        fontSize: 15,
    },
})

export default CustomButton
